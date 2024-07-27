import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import { AttributeIcon } from "~/modules/attributes/AttributeIcon.tsx"
import { listAttributeIds } from "~/modules/attributes/data.ts"
import type { ApiCharacter } from "../characters/types.ts"
import { AttributeDiceRollButton } from "./AttributeDiceRollButton.tsx"

export function AttributeDiceRollButtonGrid({
	characters,
	variant = "horizontal",
	...props
}: {
	characters: ApiCharacter[]
	variant?: "stacked" | "horizontal"
} & ComponentProps<"div">) {
	return (
		<div
			{...props}
			data-variant={variant}
			className={twMerge(
				"grid auto-cols-fr grid-flow-col gap-2 data-[variant=stacked]:grid-flow-row",
				props.className,
			)}
		>
			{listAttributeIds().map((id) => (
				<AttributeDiceRollButton
					key={id}
					characters={characters}
					icon={<AttributeIcon id={id} />}
					attribute={id}
				/>
			))}
		</div>
	)
}
