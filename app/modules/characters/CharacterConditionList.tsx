import { useMutation } from "convex/react"
import { Iterable, pipe } from "effect"
import { dedupeWith } from "effect/Array"
import * as React from "react"
import { titleCase } from "../../../common/string.ts"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import type { ApiCharacterCondition } from "../../../convex/characters/types.ts"
import { panel } from "../../ui/styles.ts"
import { getColorStyle } from "../user-colors/data.ts"
import type { ApiCharacter } from "./types.ts"

export function CharacterConditionList({
	characters,
}: {
	characters: ApiCharacter[]
}) {
	const conditions = pipe(
		characters,
		Iterable.flatMap((it) => it.conditions ?? []),
		dedupeWith((a, b) => a.name === b.name && a.color === b.color),
	)

	return conditions.length > 0 ?
			<ul className="flex flex-wrap gap-1.5">
				{conditions.map((condition) => (
					<li key={condition.name}>
						<ConditionBadgeButton
							characterIds={characters.map((it) => it._id)}
							condition={condition}
						/>
					</li>
				))}
			</ul>
		:	<p className="opacity-50">No conditions added yet.</p>
}

function ConditionBadgeButton({
	characterIds,
	condition,
}: {
	characterIds: Id<"characters">[]
	condition: ApiCharacterCondition
}) {
	const updateConditions = useMutation(
		api.characters.functions.updateConditions,
	)

	const [, action, pending] = React.useActionState(async () => {
		await updateConditions({
			characterIds,
			action: {
				type: "remove",
				name: condition.name,
			},
		}).catch(console.error)
	}, undefined)

	return (
		<form action={action}>
			<button
				type="submit"
				data-pending={pending || undefined}
				className={panel(
					"flex-center-row h-6 px-1.5 text-sm leading-none transition data-[pending]:animate-pulse data-[pending]:opacity-50",
					getColorStyle(condition.color),
				)}
			>
				{titleCase(condition.name)}
			</button>
		</form>
	)
}
