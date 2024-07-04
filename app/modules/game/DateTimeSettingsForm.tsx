import { LucideChevronsLeft, LucideChevronsRight } from "lucide-react"
import { Button } from "~/ui/Button.tsx"
import { EditableIntegerInput } from "~/ui/EditableIntegerInput.tsx"
import { FormField, FormLayout } from "~/ui/Form.tsx"
import { EditableSelect } from "~/ui/Select.tsx"
import { useRoom } from "../rooms/roomContext.tsx"
import { useUpdateRoomMutation } from "../rooms/useUpdateRoomMutation.tsx"
import { GameTime } from "./GameTime.tsx"

export function DateTimeSettingsForm() {
	const room = useRoom()
	const updateRoom = useUpdateRoomMutation()
	const gameTime = new GameTime(room.gameTime)

	return (
		<FormLayout>
			<fieldset className="flex items-stretch gap-current">
				<FormField label="Year" className="basis-20">
					<EditableIntegerInput
						align="center"
						min={1}
						value={gameTime.year + 1}
						onSubmit={async (year) => {
							await updateRoom({
								id: room._id,
								gameTime: gameTime.withDate({ year: year - 1 }),
							})
						}}
					/>
				</FormField>

				<EditableSelect
					className="flex-1"
					label="Month"
					options={GameTime.Months.map((month, index) => ({
						id: month.name,
						label: `${month.name} (${month.season})`,
						value: index,
					}))}
					value={gameTime.month}
					onSubmit={async (month) => {
						await updateRoom({
							id: room._id,
							gameTime: gameTime.withDate({ month }),
						})
					}}
				/>

				<FormField label="Day" className="basis-20">
					<EditableIntegerInput
						align="center"
						min={1}
						max={GameTime.DaysInMonth}
						value={gameTime.day + 1}
						onSubmit={async (day) => {
							await updateRoom({
								id: room._id,
								gameTime: gameTime.withDate({ day: day - 1 }),
							})
						}}
					/>
				</FormField>
			</fieldset>

			<fieldset className="flex items-end gap-current">
				<Button
					icon={<LucideChevronsLeft />}
					text="Rewind"
					onClick={async () => {
						await updateRoom({
							id: room._id,
							gameTime: gameTime.add({
								time: -1 / GameTime.TimesOfDay.length,
							}),
						})
					}}
				/>
				<EditableSelect
					label="Time"
					className="flex-1"
					options={GameTime.TimesOfDay.map((time, index) => ({
						id: time,
						label: time,
						value: index,
					}))}
					value={gameTime.timeOfDay}
					onSubmit={async (time) => {
						await updateRoom({
							id: room._id,
							gameTime: gameTime.withDate({
								time: time / GameTime.TimesOfDay.length,
							}),
						})
					}}
				/>
				<Button
					icon={<LucideChevronsRight />}
					text="Advance"
					onClick={async () => {
						await updateRoom({
							id: room._id,
							gameTime: gameTime.add({
								time: 1 / GameTime.TimesOfDay.length,
							}),
						})
					}}
				/>
			</fieldset>
		</FormLayout>
	)
}
