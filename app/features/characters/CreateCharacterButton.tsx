import { api } from "convex-backend/_generated/api.js"
import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { useCurrentCharacterId } from "~/features/characters/useCurrentCharacterId"
import { Button } from "~/ui/Button.tsx"

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
			icon={<Lucide.UserPlus2 />}
			title="New Character"
			onClick={async () => {
				const id = await create({ roomSlug, player: username })
				setCurrentCharacterId(id)
			}}
		/>
	)
}
