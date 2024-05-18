import { useMutation, useQuery } from "convex/react"
import { LucideChevronsLeft, LucideChevronsRight, LucideClock, LucideSunrise } from "lucide-react"
import { api } from "../../../convex/_generated/api.js"
import { Button } from "../../ui/Button.tsx"
import { EditableInput } from "../../ui/EditableInput.tsx"
import { EditableIntegerInput } from "../../ui/EditableIntegerInput.tsx"
import { FormField, FormLayout, FormRow } from "../../ui/Form.tsx"
import { Menu, MenuButton, MenuItem, MenuPanel } from "../../ui/Menu.tsx"
import { EditableSelect } from "../../ui/Select.tsx"
import { GameTime } from "../game/GameTime.tsx"
import { SetMapBackgroundButton } from "../tokens/SetMapBackgroundButton.tsx"
import { useRoom } from "./roomContext.tsx"

export function RoomSettingsForm() {
	const room = useRoom()
	const scene = useQuery(api.scenes.functions.getCurrent, { roomId: room._id })
	const updateRoom = useMutation(api.rooms.functions.update)
	const updateScene = useMutation(api.scenes.functions.update)
	const gameTime = new GameTime(room.gameTime)

	return (
		<FormLayout>
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
						gameTime: gameTime.withDate({ time: time / GameTime.TimesOfDay.length }),
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
									gameTime: gameTime.add({ time: -1 / GameTime.TimesOfDay.length }),
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
									gameTime: gameTime.add({ time: 1 / GameTime.TimesOfDay.length }),
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