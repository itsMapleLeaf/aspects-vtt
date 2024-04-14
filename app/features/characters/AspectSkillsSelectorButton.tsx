import { Focusable } from "@ariakit/react"
import { useMutation, useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import * as Lucide from "lucide-react"
import { matchSorter } from "match-sorter"
import { useState } from "react"
import { groupBy } from "#app/common/collection.js"
import type { StrictOmit } from "#app/common/types.js"
import { useAsyncState } from "#app/common/useAsyncState.js"
import { Button, type ButtonPropsAsElement } from "#app/ui/Button.js"
import { Input } from "#app/ui/Input.js"
import { Modal, ModalButton, ModalPanel } from "#app/ui/Modal.js"
import { panel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"
import type { Doc } from "#convex/_generated/dataModel.js"
import { useRoom } from "../rooms/roomContext.tsx"
import { CharacterExperienceDisplay } from "./CharacterExperienceDisplay.tsx"

type ApiCharacter = FunctionReturnType<typeof api.characters.list>[number]
type ApiAspectSkill = Doc<"notionImports">["aspectSkills"][number]

export function AspectSkillsSelectorButton({
	character,
	...props
}: { character: FunctionReturnType<typeof api.characters.list>[number] } & StrictOmit<
	ButtonPropsAsElement,
	"element"
>) {
	const room = useRoom()
	const notionData = useQuery(api.notionImports.get)

	const aspectSkillsByName = new Map(
		notionData?.aspectSkills?.map((skill) => [skill.name, skill]) ?? [],
	)

	const addedAspectSkills = new Set(
		character.aspectSkills.filter((skill) => aspectSkillsByName.has(skill)),
	)

	const aspects = new Set(
		[...addedAspectSkills].flatMap((skill) => aspectSkillsByName.get(skill)?.aspects ?? []),
	)

	const getCost = (skill: ApiAspectSkill, index: number) =>
		index <= 1 ? 0 : (Math.max(0, index - 2) + 1) * 5 + (skill.aspects.length - 1) * 10

	const usedExperience = [...addedAspectSkills.values()]
		.map((name) => aspectSkillsByName.get(name))
		.filter(Boolean)
		.reduce((total, skill, index) => total + getCost(skill, index), 0)

	const availableExperience = room.experience - usedExperience

	const isPurchaseable = (skill: ApiAspectSkill, index: number) =>
		index <= 1 ?
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			skill.aspects.length === 1 && skill.aspects.includes(character.coreAspect!)
		:	getCost(skill, index) <= availableExperience &&
			skill.aspects.some((aspect) => aspects.has(aspect))

	const [search, setSearch] = useState("")
	const searchResults = matchSorter(notionData?.aspectSkills ?? [], search, {
		keys: ["name", "aspects", "description"],
	})

	const groups = groupBy(searchResults, (skill) =>
		addedAspectSkills.has(skill.name) ? "learned"
		: isPurchaseable(skill, addedAspectSkills.size) ? "available"
		: "unavailable",
	)

	return (
		<Modal>
			<Button {...props} element={<ModalButton />} />
			<ModalPanel title="Manage Aspect Skills" fullHeight className="flex flex-col gap-2 p-2">
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
					{groups
						.get("learned")
						?.map((skill) => (
							<AspectSkillItem key={skill.name} skill={skill} character={character} />
						))}
					{groups
						.get("available")
						?.map((skill) => (
							<AspectSkillItem
								key={skill.name}
								skill={skill}
								character={character}
								cost={getCost(skill, addedAspectSkills.size)}
							/>
						))}
					{groups
						.get("unavailable")
						?.map((skill) => (
							<AspectSkillItem
								key={skill.name}
								skill={skill}
								character={character}
								cost={getCost(skill, addedAspectSkills.size)}
								disabled
							/>
						))}
				</div>
			</ModalPanel>
		</Modal>
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
	const [updateState, update] = useAsyncState(useMutation(api.characters.update))
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
			{isAdded ?
				<Lucide.Minus />
			:	<Lucide.Plus />}
		</button>
	)
}
