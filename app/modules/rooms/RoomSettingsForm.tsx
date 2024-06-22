import { LucideChevronsLeft, LucideChevronsRight, LucideClock, LucideSunrise } from "lucide-react"
import { Button } from "../../ui/Button.tsx"
import { EditableIntegerInput } from "../../ui/EditableIntegerInput.tsx"
import { FormField, FormLayout } from "../../ui/Form.tsx"
import { Menu, MenuButton, MenuItem, MenuPanel } from "../../ui/Menu.tsx"
import { EditableSelect } from "../../ui/Select.tsx"
import { GameTime } from "../game/GameTime.tsx"
import { useRoom } from "./roomContext.tsx"
import { useUpdateRoomMutation } from "./useUpdateRoomMutation.tsx"

export function RoomSettingsForm() {
	const room = useRoom()
	const updateRoom = useUpdateRoomMutation()
	const gameTime = new GameTime(room.gameTime)

	return (
		<FormLayout>
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

			<EditableSelect
				label="Time"
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

			<fieldset className="grid auto-cols-fr grid-flow-col gap-[inherit]">
				<Menu>
					<MenuButton render={<Button text="Rewind" icon={<LucideChevronsLeft />} />} />
					<MenuPanel sameWidth>
						<MenuItem
							icon={<LucideClock />}
							text="Time"
							onClick={async () => {
								await updateRoom({
									id: room._id,
									gameTime: gameTime.add({
										time: -1 / GameTime.TimesOfDay.length,
									}),
								})
							}}
						/>
						<MenuItem
							icon={<LucideSunrise />}
							text="Day"
							onClick={async () => {
								await updateRoom({
									id: room._id,
									gameTime: gameTime.add({ day: -1 }),
								})
							}}
						/>
					</MenuPanel>
				</Menu>
				<Menu>
					<MenuButton render={<Button text="Advance" icon={<LucideChevronsRight />} />} />
					<MenuPanel sameWidth>
						<MenuItem
							icon={<LucideClock />}
							text="Time"
							onClick={async () => {
								await updateRoom({
									id: room._id,
									gameTime: gameTime.add({
										time: 1 / GameTime.TimesOfDay.length,
									}),
								})
							}}
						/>
						<MenuItem
							icon={<LucideSunrise />}
							text="Day"
							onClick={async () => {
								await updateRoom({
									id: room._id,
									gameTime: gameTime.add({ day: 1 }),
								})
							}}
						/>
					</MenuPanel>
				</Menu>
			</fieldset>
		</FormLayout>
	)
}
