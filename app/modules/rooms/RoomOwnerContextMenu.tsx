import type { ComponentProps } from "react"
import { useRoom } from "~/modules/rooms/roomContext.tsx"
import { ContextMenu } from "~/ui/ContextMenu.new.tsx"

export function RoomOwnerContextMenu(props: ComponentProps<typeof ContextMenu>) {
	const room = useRoom()
	if (!room.isOwner) {
		return props.trigger
	}
	return <ContextMenu {...props} />
}
