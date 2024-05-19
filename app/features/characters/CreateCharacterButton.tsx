import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel.js"
import { Button } from "../../ui/Button.tsx"
import { useRoom } from "../rooms/roomContext.tsx"

export function CreateCharacterButton({
	onCreate,
}: {
	onCreate: (id: Id<"characters">) => void
}) {
	const room = useRoom()
	const create = useMutation(api.characters.functions.create)
	return (
		<Button
			icon={<Lucide.Plus />}
			title="Add Character"
			onClick={async () => {
				const id = await create({ roomId: room._id })
				onCreate(id)
			}}
		/>
	)
}
