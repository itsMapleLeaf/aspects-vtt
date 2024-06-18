import {
	LucideBicepsFlexed,
	LucideEye,
	LucideLightbulb,
	LucideSparkles,
	LucideWind,
} from "lucide-react"
import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import type { ApiCharacter } from "../characters/types.ts"
import { AttributeDiceRollButton } from "./AttributeDiceRollButton.tsx"

export function AttributeDiceRollButtonGrid({
	characters,
	variant = "horizontal",
	...props
}: { characters: ApiCharacter[]; variant?: "stacked" | "horizontal" } & ComponentProps<"div">) {
	return (
		<div
			{...props}
			data-variant={variant}
			className={twMerge(
				"grid auto-cols-fr grid-flow-col gap-2 data-[variant=stacked]:grid-flow-row",
				props.className,
			)}
		>
			<AttributeDiceRollButton
				characters={characters}
				icon={<LucideBicepsFlexed />}
				tooltip="Strength"
				attribute="strength"
			/>
			<AttributeDiceRollButton
				characters={characters}
				icon={<LucideWind />}
				tooltip="Mobility"
				attribute="mobility"
			/>
			<AttributeDiceRollButton
				characters={characters}
				icon={<LucideEye />}
				tooltip="Sense"
				attribute="sense"
			/>
			<AttributeDiceRollButton
				characters={characters}
				icon={<LucideLightbulb />}
				tooltip="Intellect"
				attribute="intellect"
			/>
			<AttributeDiceRollButton
				characters={characters}
				icon={<LucideSparkles />}
				tooltip="Wit"
				attribute="wit"
			/>
		</div>
	)
}
