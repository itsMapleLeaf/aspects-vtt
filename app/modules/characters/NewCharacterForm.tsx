import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import { useSafeAction } from "../convex/hooks.ts"
import { useRoom } from "../rooms/roomContext.tsx"

interface NewCharacterFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
	afterCreate?: (id: Id<"characters">) => void
}

export function NewCharacterForm({ afterCreate, children, ...props }: NewCharacterFormProps) {
	const room = useRoom()
	const createCharacter = useMutation(api.characters.functions.create)

	const [, createCharacterAction] = useSafeAction(async (_formData: FormData) => {
		const id = await createCharacter({ roomId: room._id })
		afterCreate?.(id)
		return id
	})

	return (
		<form {...props} action={createCharacterAction}>
			{children}
		</form>
	)
}
