import { useMutation } from "convex/react"
import { ConvexError } from "convex/values"
import { startCase } from "lodash-es"
import type { ComponentProps } from "react"
import { toast } from "react-toastify"
import { Button } from "~/components/Button.tsx"
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

function ToastActionForm({
	action,
	successMessage,
	pendingMessage,
	...props
}: ComponentProps<"form"> & {
	action: (formData: FormData) => Promise<unknown>
	pendingMessage?: string
	successMessage?: string
}) {
	return (
		<form
			{...props}
			action={async (formData) => {
				try {
					let promise = Promise.resolve(action(formData))
					if (pendingMessage) {
						promise = toast.promise(promise, {
							pending: pendingMessage,
							success: successMessage,
						})
					}
					await promise
				} catch (error) {
					console.error(error)
					if (error instanceof ConvexError && typeof error.data === "string") {
						toast.error(error.data)
					} else {
						toast.error("Something went wrong. Try again.")
					}
				}
			}}
		/>
	)
}
