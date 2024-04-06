import { useMutation, useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import * as Lucide from "lucide-react"
import { matchSorter } from "match-sorter"
import { useState } from "react"
import type { StrictOmit } from "#app/common/types.js"
import { useAsyncState } from "#app/common/useAsyncState.js"
import { Button, type ButtonPropsAsElement } from "#app/ui/Button.js"
import { Input } from "#app/ui/Input.js"
import { Modal, ModalButton, ModalPanel } from "#app/ui/Modal.js"
import { panel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"
import type { Doc } from "#convex/_generated/dataModel.js"

export function AspectSkillsSelectorButton({
	character,
	...props
}: { character: FunctionReturnType<typeof api.characters.list>[number] } & StrictOmit<
	ButtonPropsAsElement,
	"element"
>) {
	const notionData = useQuery(api.notionImports.get)
	const [search, setSearch] = useState("")

	const aspectSkills = matchSorter(notionData?.aspectSkills ?? [], search, {
		keys: ["name", "aspects", "description"],
	})

	const addedAspectSkills = new Set(character.aspectSkills)
	aspectSkills.sort(
		(a, b) => Number(addedAspectSkills.has(b.name)) - Number(addedAspectSkills.has(a.name)),
	)

	return (
		<Modal>
			<Button {...props} element={<ModalButton />} />
			<ModalPanel title="Manage Aspect Skills">
				<div className="flex h-[calc(100dvh-theme(spacing.12))] max-h-[720px] w-[calc(100vw-theme(spacing.12))] max-w-lg flex-col gap-2 ">
					<Input
						type="search"
						placeholder="Type a skill name or aspect name"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
					/>
					<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
						{aspectSkills.map((skill) => (
							<AspectSkillItem key={skill.name} skill={skill} character={character} />
						))}
					</div>
				</div>
			</ModalPanel>
		</Modal>
	)
}

function AspectSkillItem({
	character,
	skill,
}: {
	character: FunctionReturnType<typeof api.characters.list>[number]
	skill: Doc<"notionImports">["aspectSkills"][number]
}) {
	const [updateState, update] = useAsyncState(useMutation(api.characters.update))
	const isAdded = character.aspectSkills.includes(skill.name)
	return (
		<button
			type="button"
			className={panel(
				"flex items-center gap-2 px-3 py-2.5 text-left transition hover:bg-primary-100/50 disabled:opacity-50",
			)}
			disabled={updateState.status === "pending"}
			onClick={() => {
				update({
					id: character._id,
					aspectSkills: isAdded ? { remove: skill.name } : { add: skill.name },
				})
			}}
		>
			<div className="flex-1">
				<h3 className="mb-1 text-xl font-light">{skill.name}</h3>
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
