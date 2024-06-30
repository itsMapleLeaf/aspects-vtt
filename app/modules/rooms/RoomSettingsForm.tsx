import { EditableIntegerInput } from "../../ui/EditableIntegerInput.tsx"
import { FormField, FormLayout } from "../../ui/Form.tsx"
import { useRoom } from "./roomContext.tsx"
import { useUpdateRoomMutation } from "./useUpdateRoomMutation.tsx"

export function RoomSettingsForm() {
	const room = useRoom()
	const updateRoom = useUpdateRoomMutation()

	return (
		<FormLayout>
			<FormField label="Experience">
				<EditableIntegerInput
					value={room.experience}
					onSubmit={(experience) => updateRoom({ id: room._id, experience })}
				/>
			</FormField>
		</FormLayout>
	)
}
