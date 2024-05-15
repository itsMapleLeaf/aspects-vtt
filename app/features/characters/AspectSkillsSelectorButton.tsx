import { Focusable } from "@ariakit/react"
import { useMutation, useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import { matchSorter } from "match-sorter"
import { useState } from "react"
import { api } from "../../../convex/_generated/api.js"
import type { Doc } from "../../../convex/_generated/dataModel.js"
import { groupBy } from "../../common/collection.ts"
import type { StrictOmit } from "../../common/types.ts"
import { useAsyncState } from "../../common/useAsyncState.ts"
import { Button, type ButtonPropsAsElement } from "../../ui/Button.tsx"
import { Input } from "../../ui/Input.tsx"
import { ModalButton, ModalPanel, ModalPanelContent, ModalProvider } from "../../ui/Modal.tsx"
import { panel } from "../../ui/styles.ts"
import { useRoom } from "../rooms/roomContext.tsx"
import { CharacterExperienceDisplay } from "./CharacterExperienceDisplay.tsx"

type ApiCharacter = FunctionReturnType<typeof api.characters.functions.list>[number]
type ApiAspectSkill = Doc<"notionImports">["aspectSkills"][number]

export function AspectSkillsSelectorButton({
	character,
	...props
}: { character: FunctionReturnType<typeof api.characters.functions.list>[number] } & StrictOmit<
	ButtonPropsAsElement,
	"element"
>) {
	return (
		<ModalProvider>
			<Button {...props} element={<ModalButton />} />
			<ModalPanel title="Manage Aspect Skills" fullHeight>
				<ModalPanelContent className="flex flex-col gap-2 p-2">
					<SelectorForm character={character} />
				</ModalPanelContent>
			</ModalPanel>
		</ModalProvider>
	)
}

function SelectorForm({
	character,
}: {
	character: ApiCharacter
}) {
	const room = useRoom()
	const notionData = useQuery(api.notionImports.functions.get, {})

	const aspectSkillsByName = new Map(
		notionData?.aspectSkills?.map((skill) => [skill.name, skill]) ?? [],
	)

	const addedAspectSkills = new Set(
		character.aspectSkills.filter((skill) => aspectSkillsByName.has(skill)),
	)

	const aspects = new Set(
		Iterator.from(addedAspectSkills).flatMap(
			(skill) => aspectSkillsByName.get(skill)?.aspects ?? [],
		),
	)

	const getCost = (skill: ApiAspectSkill, index: number) =>
		index <= 1 ? 0 : skill.aspects.length * 5 + Math.max(0, index - 2) * 5

	const usedExperience = addedAspectSkills
		.values()
		.map((name) => aspectSkillsByName.get(name))
		.filter((skill) => skill != null)
		.reduce((total, skill, index) => total + getCost(skill, index), 0)

	const availableExperience = room.experience - usedExperience

	const isPurchaseable = (skill: ApiAspectSkill, index: number) =>
		index <= 1
			? // biome-ignore lint/style/noNonNullAssertion: <explanation>
				skill.aspects.length === 1 && skill.aspects.includes(character.coreAspect!)
			: getCost(skill, index) <= availableExperience &&
				skill.aspects.some((aspect) => aspects.has(aspect))

	const [search, setSearch] = useState("")
	const searchResults = matchSorter(
		(notionData?.aspectSkills ?? [])
			.sort((a, b) => a.name.localeCompare(b.name))
			.sort((a, b) => a.aspects.length - b.aspects.length),
		search,
		{
			keys: ["name", "aspects", "description"],
		},
	)

	const groups = groupBy(searchResults, (skill) => {
		if (addedAspectSkills.has(skill.name)) return "learned"
		if (isPurchaseable(skill, addedAspectSkills.size)) return "available"
		return "unavailable"
	})

	return (
		<>
			<CharacterExperienceDisplay character={character} className="font-bold" />
			<Focusable
				autoFocus
				render={
					<Input
						type="search"
						placeholder="Type a skill name or aspect name"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
					/>
				}
			/>
			<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
				{groups.get("learned")?.map((skill, index) => (
					<AspectSkillItem
						key={skill.name}
						skill={skill}
						character={character}
						cost={getCost(skill, index)}
					/>
				))}
				{groups.get("available")?.map((skill) => (
					<AspectSkillItem
						key={skill.name}
						skill={skill}
						character={character}
						cost={getCost(skill, addedAspectSkills.size)}
					/>
				))}
				{groups.get("unavailable")?.map((skill) => (
					<AspectSkillItem
						key={skill.name}
						skill={skill}
						character={character}
						cost={getCost(skill, addedAspectSkills.size)}
						disabled={!room.isOwner}
					/>
				))}
			</div>
		</>
	)
}

function AspectSkillItem({
	character,
	skill,
	cost,
	disabled,
}: {
	character: ApiCharacter
	skill: ApiAspectSkill
	cost?: number
	disabled?: boolean
}) {
	const [updateState, update] = useAsyncState(useMutation(api.characters.functions.update))
	const isAdded = character.aspectSkills.includes(skill.name)
	return (
		<button
			type="button"
			className={panel(
				"flex items-center gap-2 px-3 py-2.5 text-left transition hover:bg-primary-100/50 disabled:opacity-50",
			)}
			disabled={updateState.status === "pending" || disabled}
			onClick={(event) => {
				event.currentTarget.blur()
				update({
					id: character._id,
					aspectSkills: isAdded ? { remove: skill.name } : { add: skill.name },
				})
			}}
		>
			<div className="flex-1">
				<h3 className="mb-1 text-xl font-light">{skill.name}</h3>
				{cost !== undefined && (
					<p className="mb-1.5 text-sm/none font-bold uppercase tracking-wide">{cost} EXP</p>
				)}
				<p className="mb-1.5 whitespace-pre-line text-pretty">{skill.description}</p>
				<ul className="flex flex-wrap gap-1">
					{skill.aspects.map((aspect) => (
						<li key={aspect} className={panel("bg-primary-100/50 px-2 py-1.5 text-sm/none")}>
							{aspect}
						</li>
					))}
				</ul>
			</div>
			{isAdded ? <Lucide.Minus /> : <Lucide.Plus />}
		</button>
	)
}
