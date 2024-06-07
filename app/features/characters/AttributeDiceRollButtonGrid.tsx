import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import { AttributeDiceRollButton } from "./AttributeDiceRollButton.tsx"
import type { ApiCharacter } from "./types.ts"

export function AttributeDiceRollButtonGrid({
	characters,
	variant = "stacked",
	...props
}: { characters: ApiCharacter[]; variant?: "stacked" | "horizontal" } & ComponentProps<"div">) {
	return (
		<div
			{...props}
			data-variant={variant}
			className={twMerge("flex gap-2 data-[variant=stacked]:flex-col", props.className)}
		>
			<div
				data-variant={variant}
				className="flex gap-[inherit] *:flex-1 data-[variant=horizontal]:contents"
			>
				<AttributeDiceRollButton characters={characters} text="Strength" attribute="strength" />
				<AttributeDiceRollButton characters={characters} text="Mobility" attribute="mobility" />
			</div>
			<div
				data-variant={variant}
				className="flex gap-[inherit] *:flex-1 data-[variant=horizontal]:contents"
			>
				<AttributeDiceRollButton characters={characters} text="Sense" attribute="sense" />
				<AttributeDiceRollButton characters={characters} text="Intellect" attribute="intellect" />
				<AttributeDiceRollButton characters={characters} text="Wit" attribute="wit" />
			</div>
		</div>
	)
}
