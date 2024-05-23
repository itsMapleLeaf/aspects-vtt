import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import { AttributeDiceRollButton } from "./AttributeDiceRollButton.tsx"
import type { ApiCharacter } from "./types.ts"

export function AttributeDiceRollButtonGrid({
	characters,
	...props
}: { characters: ApiCharacter[] } & ComponentProps<"div">) {
	return (
		<div {...props} className={twMerge("flex flex-col gap-2", props.className)}>
			<div className="flex gap-[inherit] *:flex-1">
				<AttributeDiceRollButton characters={characters} text="Strength" attribute="strength" />
				<AttributeDiceRollButton characters={characters} text="Mobility" attribute="mobility" />
			</div>
			<div className="flex gap-[inherit] *:flex-1">
				<AttributeDiceRollButton characters={characters} text="Sense" attribute="sense" />
				<AttributeDiceRollButton characters={characters} text="Intellect" attribute="intellect" />
				<AttributeDiceRollButton characters={characters} text="Wit" attribute="wit" />
			</div>
		</div>
	)
}
