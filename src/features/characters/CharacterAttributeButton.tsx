import { useMutation } from "convex/react"
import { startCase } from "lodash-es"
import { Button } from "~/components/Button.tsx"
import { ToastActionForm } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/ui/tooltip.tsx"
import { ApiCharacter } from "./types"

export function CharacterAttributeButton({
	character,
	attribute,
	icon,
}: {
	character: Pick<ApiCharacter, "_id">
	attribute: keyof NonNullable<ApiCharacter["attributes"]>
	icon: React.ReactNode
}) {
	const createAttributeRollMessage = useMutation(
		api.entities.messages.createAttributeRollMessage,
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
