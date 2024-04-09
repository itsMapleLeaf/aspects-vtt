import type { PopoverDisclosureProps } from "@ariakit/react"
import { UserButton } from "@clerk/remix"
import { useHref, useLocation } from "@remix-run/react"
import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { type ReactElement, useEffect, useRef, useState } from "react"
import { useAsyncState } from "#app/common/useAsyncState.js"
import { CharactersPanel } from "#app/features/characters/CharactersPanel.js"
import { MessageForm } from "#app/features/messages/MessageForm.js"
import { MessageList } from "#app/features/messages/MessageList.js"
import { RoomOwnerOnly, useRoom } from "#app/features/rooms/roomContext.js"
import { SetMapBackgroundButton } from "#app/features/tokens/SetMapBackgroundButton.js"
import { TokenMap } from "#app/features/tokens/TokenMap.js"
import type { ViewportController } from "#app/features/tokens/TokenMapViewport.tsx"
import { AppHeader } from "#app/ui/AppHeader.js"
import { Button } from "#app/ui/Button.js"
import { DefinitionList } from "#app/ui/DefinitionList.js"
import { FormField } from "#app/ui/FormField.js"
import { Input } from "#app/ui/Input.js"
import { Popover, PopoverPanel, PopoverTrigger } from "#app/ui/Popover.js"
import { panel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"

export default function RoomIndexRoute() {
	const room = useRoom()
	const currentUrl = useHref(useLocation())
	const viewportRef = useRef<ViewportController>(null)
	const [drawingArea, setDrawingArea] = useState(false)
	return (
		<div className="isolate flex h-dvh flex-col gap-4 p-4">
			<JoinRoom />
			<div className="fixed inset-0 -z-10">
				<TokenMap
					viewportRef={viewportRef}
					drawingArea={drawingArea}
					onFinishDrawingArea={() => setDrawingArea(false)}
				/>
			</div>
			<div className="-mx-4 -mt-4 border-b border-primary-300 bg-primary-100/75 p-4 backdrop-blur">
				<AppHeader>
					<UserButton afterSignOutUrl={currentUrl} />
				</AppHeader>
			</div>
			<main className="pointer-events-none flex min-h-0 flex-1 justify-between gap-2 *:pointer-events-auto">
				<MessagesPanel />
				<Toolbar>
					{room.isOwner && <CellSizeField />}
					{room.isOwner && <SetMapBackgroundButton />}

					<Button
						text="Reset View"
						icon={<Lucide.Compass />}
						onClick={() => viewportRef.current?.resetView()}
					/>

					<Button
						icon={<Lucide.SquareDashedMousePointer />}
						text="Draw Area"
						onClick={() => setDrawingArea(true)}
					/>

					<GeneralSkillsButton />

					<PopoverButton icon={<Lucide.Swords />} text="Combat">
						<ul className="flex list-inside list-disc flex-col gap-1.5">
							<li>Make one action (requires a dice roll)</li>
							<li>Take 1 fatigue → one extra action</li>
							<li>
								Move meters <abbr title="less than or equal to">≤</abbr> mobility
							</li>
						</ul>
					</PopoverButton>

					<PopoverButton icon={<Lucide.HeartCrack />} text="Critical Injuries">
						<div className="-my-3 *:mb-3">
							<section>
								<h3 className="-mx-3 mb-3 border-b border-primary-300 bg-primary-100 p-4 text-lg font-bold">
									Damage
								</h3>
								<DefinitionList
									items={[
										{
											name: "Internal Bleeding",
											description: "Any time you take damage, double it.",
										},
										{
											name: "Broken Bone",
											description: "Subtract 1d12 movement each turn to a minimum of 1.",
										},
										{
											name: "Concussion",
											description:
												"Double the modifier value of snag dice for Sense, Intellect, and Wit rolls.",
										},
										{
											name: "Dislocation",
											description:
												"Subtract 1d12 from the effect of your strength and mobility rolls.",
										},
										{
											name: "Pulled Muscle",
											description: "Immediately take 1d6 additional damage.",
										},
										{
											name: "Overexerted",
											description: "All of your action rolls use a 1d4.",
										},
									]}
								/>
							</section>

							<section>
								<h3 className=" -mx-3 mb-3 border-y border-primary-300 bg-primary-100 p-4 text-lg font-bold">
									Fatigue
								</h3>
								<DefinitionList
									items={[
										{
											name: "Crippling Migraine",
											description: "You must take one fatigue before making any action.",
										},
										{
											name: "Panic Attack",
											description: "Immediately take 1d6 hits of fatigue.",
										},
										{
											name: "Neural Stunlock",
											description: "Double the modifier value of snag dice for intellect rolls.",
										},
										{
											name: "Exhaustion",
											description: "The effect of your wit and intellect rolls is 1.",
										},
										{
											name: "Confusion",
											description: "Your sense, intellect, and wit rolls use a 1d4.",
										},
										{
											name: "Sensory Overload",
											description: "The effect of your sense rolls is 1.",
										},
									]}
								/>
							</section>
						</div>
					</PopoverButton>

					<RoomOwnerOnly>
						<PopoverButton icon={<Lucide.Wrench />} text="Room Settings">
							<RoomSettingsForm />
						</PopoverButton>
					</RoomOwnerOnly>
				</Toolbar>
				<CharactersPanel />
			</main>
		</div>
	)
}

function JoinRoom() {
	const room = useRoom()
	const user = useQuery(api.auth.user)
	const join = useMutation(api.rooms.join)
	const hasJoined = room.players.some((p) => p.clerkId === user?.value?.clerkId)

	useEffect(() => {
		if (!hasJoined) join({ id: room._id })
	}, [room._id, join, hasJoined])

	return null
}

function MessagesPanel() {
	return (
		<div
			className={panel(
				"flex max-w-[360px] flex-1 flex-col gap-2 rounded-md bg-primary-100/75 p-2 shadow-md shadow-black/50 backdrop-blur",
			)}
		>
			<MessageForm />
			<div className="min-h-0 flex-1">
				<MessageList />
			</div>
		</div>
	)
}

function GeneralSkillsButton() {
	const notionData = useQuery(api.notionImports.get)
	return (
		<PopoverButton icon={<Lucide.Hammer />} text="General Skills">
			<DefinitionList
				items={notionData?.generalSkills.toSorted((a, b) => a.name.localeCompare(b.name))}
			/>
		</PopoverButton>
	)
}

function Toolbar({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-1 flex-wrap items-end justify-center gap-[inherit] self-end drop-shadow">
			{children}
		</div>
	)
}

function RoomSettingsForm() {
	const room = useRoom()
	const [updateRoomState, updateRoom] = useAsyncState(useMutation(api.rooms.update))
	return (
		<div className="grid gap-2">
			<FormField label="Experience">
				<Input
					type="number"
					value={updateRoomState.args?.experience ?? room.experience}
					min={0}
					step={5}
					onChange={(e) => updateRoom({ id: room._id, experience: Number(e.target.value) })}
				/>
			</FormField>
		</div>
	)
}

function CellSizeField() {
	const room = useRoom()
	const [updateRoomState, updateRoom] = useAsyncState(useMutation(api.rooms.update))
	return (
		<FormField label="Cell Size" htmlFor="cellSize">
			<Input
				id="cellSize"
				type="number"
				className="w-20"
				value={updateRoomState.args?.mapCellSize ?? room.mapCellSize}
				onChange={(event) => {
					const value = event.currentTarget.valueAsNumber
					if (Number.isNaN(value)) return
					updateRoom({ id: room._id, mapCellSize: Math.max(value, 1) })
				}}
			/>
		</FormField>
	)
}

function PopoverButton({
	children,
	text,
	icon,
	...props
}: PopoverDisclosureProps & { text: string; icon: ReactElement }) {
	return (
		<Popover>
			<Button icon={icon} text={text} element={<PopoverTrigger {...props} />} />
			<PopoverPanel className="max-h-[480px] w-screen max-w-[360px] overflow-y-auto p-3">
				{children}
			</PopoverPanel>
		</Popover>
	)
}
