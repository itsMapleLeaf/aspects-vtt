import { useMutation } from "convex/react"
import { startCase } from "lodash-es"
import { Button } from "~/components/Button.tsx"
import { ToastActionForm } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import type { NormalizedCharacter } from "~/convex/characters.ts"
import { CharacterAttributeName } from "~/features/characters/types.ts"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/ui/tooltip.tsx"

export function CharacterAttributeButton({
	character,
	attribute,
	icon,
}: {
	character: NormalizedCharacter
	attribute: CharacterAttributeName
	icon: React.ReactNode
}) {
	const createAttributeRollMessage = useMutation(
		api.messages.createAttributeRollMessage,
	)
	return (
		<Tooltip placement="bottom">
			<ToastActionForm
				action={async () => {
					await createAttributeRollMessage({
						characterId: character._id,
						attribute,
					})
				}}
			>
				<TooltipTrigger
					render={
						<Button appearance="clear" square icon={icon} type="submit" />
					}
				></TooltipTrigger>
			</ToastActionForm>
			<TooltipContent>Roll {startCase(attribute)}</TooltipContent>
		</Tooltip>
	)
}
