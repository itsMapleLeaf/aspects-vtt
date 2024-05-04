import { useMutation, useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api.js"
import { EditableInput } from "../../ui/EditableInput.tsx"
import { EditableIntegerInput } from "../../ui/EditableIntegerInput.tsx"
import { FormField, FormLayout, FormRow } from "../../ui/Form.tsx"
import { Select } from "../../ui/Select.tsx"
import { GameTime } from "../game/GameTime.tsx"
import { SetMapBackgroundButton } from "../tokens/SetMapBackgroundButton.tsx"
import { useRoom } from "./roomContext.tsx"

export function RoomSettingsForm() {
	const room = useRoom()
	const scene = useQuery(api.scenes.getCurrent, { roomId: room._id })
	const updateRoom = useMutation(api.rooms.update)
	const updateScene = useMutation(api.scenes.update)
	const gameTime = new GameTime(room.gameTime)

	return (
		<FormLayout asChild>
			<div>
				{scene && (
					<>
						<FormField label="Scene Name">
							<EditableInput
								value={scene.name}
								onSubmit={(name) => updateScene({ id: scene._id, name })}
							/>
						</FormField>

						<FormRow className="items-end">
							<FormField label="Cell Size" className="basis-24">
								<EditableIntegerInput
									align="center"
									value={scene.cellSize}
									onSubmit={(cellSize) => updateScene({ id: scene._id, cellSize })}
								/>
							</FormField>
							<div className="flex-1">
								<SetMapBackgroundButton scene={scene} />
							</div>
						</FormRow>
					</>
				)}

				<FormField label="Experience">
					<EditableIntegerInput
						value={room.experience}
						onSubmit={(experience) => updateRoom({ id: room._id, experience })}
					/>
				</FormField>

				<fieldset className="flex items-stretch gap-[inherit]">
					<FormField label="Year" className="basis-20">
						<EditableIntegerInput
							align="center"
							min={1}
							value={gameTime.year + 1}
							onSubmit={console.log}
						/>
					</FormField>

					<Select
						className="flex-1"
						label="Month"
						options={GameTime.Months.map((month, index) => ({
							id: month.name,
							label: `${month.name} (${month.season})`,
							value: index,
						}))}
						value={gameTime.month}
						onChange={console.log}
					/>

					<FormField label="Day" className="basis-20">
						<EditableIntegerInput
							align="center"
							min={1}
							value={gameTime.day + 1}
							onSubmit={console.log}
						/>
					</FormField>
				</fieldset>

				<Select
					label="Time"
					options={GameTime.TimesOfDay.map((time, index) => ({
						id: time,
						label: time,
						value: index,
					}))}
					value={gameTime.timeOfDay}
					onChange={() => {}}
				/>
			</div>
		</FormLayout>
	)
}
