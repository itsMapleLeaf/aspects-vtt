import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { useCurrentCharacterId } from "#app/features/characters/useCurrentCharacterId.ts"
import { Button } from "#app/ui/Button.tsx"
import { api } from "#convex/_generated/api.js"
import { CHARACTER_FIELDS } from "./characterFields.tsx"

export function CreateCharacterButton({
	roomSlug,
	username,
}: {
	roomSlug: string
	username: string
}) {
	const create = useMutation(api.characters.create)
	const [, setCurrentCharacterId] = useCurrentCharacterId()
	return (
		<Button
			icon={<Lucide.Plus />}
			title="New Character"
			onClick={async () => {
				const id = await create({
					roomSlug,
					player: username,
					fields: CHARACTER_FIELDS.flatMap((field) => field.initialValues()),
				})
				setCurrentCharacterId(id)
			}}
		/>
	)
}
