import { useMutation, useQuery } from "convex/react"
import { startTransition, useMemo, useState } from "react"
import { twMerge } from "tailwind-merge"
import { Button } from "~/components/Button.tsx"
import { Field } from "~/components/Field.tsx"
import { api } from "~/convex/_generated/api.js"
import { Id } from "~/convex/_generated/dataModel.js"
import { textInput } from "~/styles/input.ts"
import { useToastAction } from "../../components/ToastActionForm.tsx"
import { useRoomContext } from "../rooms/context.tsx"
import { getConditionColorClasses } from "./conditions.ts"

export function CharacterConditionsInput({
	characterIds,
}: {
	characterIds: Id<"characters">[]
}) {
	const [newCondition, setNewCondition] = useState("")
	const updateCharacter = useMutation(api.characters.updateMany)
	const room = useRoomContext()
	const allCharacters = useQuery(api.characters.list, { roomId: room._id })

	const characters = useMemo(() => {
		if (!allCharacters) return []
		return allCharacters.filter((char) => characterIds.includes(char._id))
	}, [allCharacters, characterIds])

	const allConditions = new Set(
		characters?.flatMap((char) => char.conditions ?? []) ?? [],
	)

	const [, submit, pending] = useToastAction(
		async (
			_,
			{ action, condition }: { action: "add" | "remove"; condition: string },
		) => {
			if (condition.trim() === "") return
			if (action === "add") {
				await updateCharacter({
					updates: characters.map((character) => ({
						characterId: character._id,
						conditions: [...character.conditions, condition],
					})),
				})
			} else {
				await updateCharacter({
					updates: characters.map((character) => ({
						characterId: character._id,
						conditions: [...character.conditions].filter(
							(c) => c !== condition,
						),
					})),
				})
			}
			setNewCondition("")
		},
	)

	return (
		<div className="flex flex-col gap-2">
			<Field label="Conditions">
				<input
					type="text"
					className={textInput("transition", pending && "opacity-50")}
					value={newCondition}
					onChange={(event) => setNewCondition(event.target.value)}
					onKeyDown={(event) => {
						if (pending) return
						if (event.key === "Enter") {
							event.preventDefault()
							startTransition(() => {
								submit({ action: "add", condition: newCondition })
							})
						}
					}}
					placeholder="Add condition..."
				/>
			</Field>
			<div className="flex flex-wrap gap-1 empty:hidden">
				{[...allConditions].map((condition) => (
					<form
						key={condition}
						className="contents"
						action={() => {
							submit({ action: "remove", condition })
						}}
					>
						<Button
							type="submit"
							className={twMerge(
								"h-7! rounded-sm border-2 px-2! text-sm! leading-none text-white shadow-sm",
								getConditionColorClasses(condition),
							)}
						>
							{condition}
						</Button>
					</form>
				))}
			</div>
		</div>
	)
}
