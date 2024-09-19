import { startCase } from "lodash-es"
import { Button } from "~/components/Button.tsx"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/ui/tooltip.tsx"
import { ApiCharacter } from "./types"

export function CharacterAttributeButton({
	attribute,
	icon,
}: {
	attribute: keyof NonNullable<ApiCharacter["attributes"]>
	icon: React.ReactNode
}) {
	return (
		<Tooltip placement="bottom">
			<TooltipTrigger
				render={<Button appearance="clear" shape="circle" icon={icon} />}
			></TooltipTrigger>
			<TooltipContent>{startCase(attribute)}</TooltipContent>
		</Tooltip>
	)
}
