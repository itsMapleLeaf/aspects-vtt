import { startCase } from "lodash-es"
import { Character } from "~/types.ts"
import { Button } from "~/ui/button.tsx"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/ui/tooltip.tsx"

export function CharacterAttributeButton({
	attribute,
	icon,
}: {
	attribute: keyof NonNullable<Character["attributes"]>
	icon: React.ReactNode
}) {
	return (
		<Tooltip placement="bottom">
			<TooltipTrigger
				render={<Button variant="ghost" size="icon" className="*:size-5" />}
			>
				{icon}
			</TooltipTrigger>
			<TooltipContent>{startCase(attribute)}</TooltipContent>
		</Tooltip>
	)
}
