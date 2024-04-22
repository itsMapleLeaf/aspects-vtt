import * as Ariakit from "@ariakit/react"
import { UserButton } from "@clerk/remix"
import { useHref, useLocation } from "@remix-run/react"
import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useMutationState } from "#app/common/convex.js"
import { useListener } from "#app/common/emitter.js"
import { CharactersPanel } from "#app/features/characters/CharactersPanel.js"
import { editCharacterEvent } from "#app/features/characters/events.js"
import { MessageForm } from "#app/features/messages/MessageForm.js"
import { MessageList } from "#app/features/messages/MessageList.js"
import { CanvasMap } from "#app/features/rooms/CanvasMap.js"
import { CombatInitiative } from "#app/features/rooms/CombatInitiative.js"
import { RoomOwnerOnly, useCharacters, useRoom } from "#app/features/rooms/roomContext.js"
import { SceneList } from "#app/features/scenes/SceneList.js"
import { useScene } from "#app/features/scenes/context.js"
import { SetMapBackgroundButton } from "#app/features/tokens/SetMapBackgroundButton.js"
import type { ViewportController } from "#app/features/tokens/TokenMapViewport.tsx"
import { AppHeader } from "#app/ui/AppHeader.js"
import { DefinitionList } from "#app/ui/DefinitionList.js"
import { FormField, FormLayout, FormRow } from "#app/ui/Form.js"
import { Input } from "#app/ui/Input.js"
import { Modal, ModalButton, ModalPanel, ModalPanelContent } from "#app/ui/Modal.js"
import { panel, translucentPanel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"
import {
	Toolbar,
	ToolbarButton,
	ToolbarDialogButton,
	ToolbarDialogContent,
	ToolbarPopoverButton,
	ToolbarSeparator,
} from "./Toolbar"

export default function RoomIndexRoute() {
	const scene = useScene()
	const currentUrl = useHref(useLocation())
	const viewportRef = useRef<ViewportController>(null)
	const [drawingArea, setDrawingArea] = useState(false)
	return (
		<>
			<JoinRoomEffect />

			<div className="fixed inset-0 -z-10">
				{/* <TokenMap
					viewportRef={viewportRef}
					drawingArea={drawingArea}
					onFinishDrawingArea={() => setDrawingArea(false)}
				/> */}
				<CanvasMap />
			</div>

			<div
				className={translucentPanel(
					"px-4 rounded-none border-0 border-b h-16 flex flex-col justify-center",
				)}
			>
				<AppHeader
					end={<UserButton afterSignOutUrl={currentUrl} />}
					center={
						<Toolbar>
							<RoomOwnerOnly>
								<Modal>
									<ModalButton render={<ToolbarButton text="Scenes" icon={<Lucide.Images />} />} />
									<ModalPanel title="Scenes" className="max-w-screen-lg">
										<ModalPanelContent className="p-3">
											<SceneList />
										</ModalPanelContent>
									</ModalPanel>
								</Modal>
							</RoomOwnerOnly>

							<CharactersToolbarButton />

							<ToolbarSeparator />

							<ToolbarButton
								text="Draw Area"
								icon={<Lucide.SquareDashedMousePointer />}
								onClick={() => setDrawingArea(true)}
							/>

							<ToolbarButton
								text="Reset View"
								icon={<Lucide.Compass />}
								onClick={() => viewportRef.current?.resetView()}
							/>

							<ToolbarSeparator />

							<ToolbarDialogButton
								text="Chat & Dice"
								icon={<Lucide.MessageSquareMore />}
								defaultOpen
							>
								<ToolbarDialogContent
									className={
										"fixed bottom-0 right-0 top-16 w-[24rem] transition translate-x-4 p-2 opacity-0 data-[enter]:translate-x-0 data-[enter]:opacity-100"
									}
								>
									<div className={translucentPanel("h-full")}>
										<MessagesPanel />
									</div>
								</ToolbarDialogContent>
							</ToolbarDialogButton>

							<ToolbarPopoverButton
								id="combatInitiative"
								text="Combat Initiative"
								icon={<Lucide.ListStart />}
							>
								<div className="p-4">
									<CombatInitiative />
								</div>
							</ToolbarPopoverButton>

							<ToolbarPopoverButton
								id="generalSkills"
								text="General Skills"
								icon={<Lucide.Hammer />}
							>
								<div className="p-4">
									<GeneralSkillsList />
								</div>
							</ToolbarPopoverButton>

							<ToolbarPopoverButton id="combatInfo" text="Combat Info" icon={<Lucide.Swords />}>
								<div className="p-4">
									<CombatDetails />
								</div>
							</ToolbarPopoverButton>

							<ToolbarPopoverButton
								id="criticalInjuries"
								text="Critical Injuries"
								icon={<Lucide.HeartCrack />}
							>
								<div className="p-4">
									<CriticalInjuryDetails />
								</div>
							</ToolbarPopoverButton>

							<ToolbarSeparator />

							<RoomOwnerOnly>
								<ToolbarPopoverButton id="settings" text="Settings" icon={<Lucide.Settings />}>
									<RoomSettingsForm />
								</ToolbarPopoverButton>
							</RoomOwnerOnly>
						</Toolbar>
					}
				/>
			</div>

			<h2 className="pointer-events-none fixed inset-x-0 top-16 mx-auto max-w-sm text-pretty p-4 text-center text-2xl font-light opacity-50 drop-shadow-md">
				{scene?.name}
			</h2>

			<CombatTurnBanner />
		</>
	)
}

function CharactersToolbarButton() {
	const store = Ariakit.useDialogStore({ defaultOpen: true })
	useListener(editCharacterEvent, () => store.show())
	return (
		<ToolbarDialogButton text="Characters" icon={<Lucide.Users2 />} store={store}>
			<ToolbarDialogContent
				className={
					"fixed bottom-0 left-0 top-16 w-[24rem] transition -translate-x-4 p-2 opacity-0 data-[enter]:translate-x-0 data-[enter]:opacity-100"
				}
			>
				<div className={translucentPanel("h-full")}>
					<CharactersPanel />
				</div>
			</ToolbarDialogContent>
		</ToolbarDialogButton>
	)
}

function CombatDetails() {
	return (
		<ul className="flex list-inside list-disc flex-col gap-1.5">
			<li>Make one action</li>
			<li>Take 1 fatigue → one extra action</li>
			<li>
				Move meters <abbr title="less than or equal to">≤</abbr> mobility
			</li>
		</ul>
	)
}

function CriticalInjuryDetails() {
	return (
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
							description: "Subtract 1d12 from the effect of your strength and mobility rolls.",
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
				<h3 className="-mx-3 mb-3 border-y border-primary-300 bg-primary-100 p-4 text-lg font-bold">
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
	)
}

function JoinRoomEffect() {
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
		<div className="flex h-full flex-1 flex-col gap-2 rounded-md p-2">
			<MessageForm />
			<div className="min-h-0 flex-1">
				<MessageList />
			</div>
		</div>
	)
}

function GeneralSkillsList() {
	const notionData = useQuery(api.notionImports.get)
	return (
		<DefinitionList
			items={notionData?.generalSkills.toSorted((a, b) => a.name.localeCompare(b.name))}
		/>
	)
}

function RoomSettingsForm() {
	const room = useRoom()
	const scene = useScene()
	const [updateRoomState, updateRoom] = useMutationState(api.rooms.update)
	const [updateSceneState, updateScene] = useMutationState(api.scenes.update)
	return (
		<FormLayout className="grid gap-2">
			{scene && (
				<>
					<FormField label="Scene Name" htmlFor="sceneName">
						<Input
							id="sceneName"
							type="text"
							className="w-full"
							value={updateSceneState.args?.name ?? scene.name}
							onChange={(event) => {
								const value = event.currentTarget.value
								updateScene({ id: scene._id, name: value })
							}}
						/>
					</FormField>
					<FormRow className="items-end">
						<FormField label="Cell Size" htmlFor="cellSize">
							<Input
								id="cellSize"
								type="number"
								className="w-20"
								value={updateSceneState.args?.cellSize ?? scene.cellSize}
								onChange={(event) => {
									const value = event.currentTarget.valueAsNumber
									if (Number.isNaN(value)) return
									updateScene({ id: scene._id, cellSize: Math.max(value, 8) })
								}}
							/>
						</FormField>
						<div className="flex-1">
							<SetMapBackgroundButton scene={scene} />
						</div>
					</FormRow>
				</>
			)}
			<FormField label="Experience">
				<Input
					type="number"
					value={updateRoomState.args?.experience ?? room.experience}
					min={0}
					step={5}
					onChange={(e) => updateRoom({ id: room._id, experience: Number(e.target.value) })}
				/>
			</FormField>
		</FormLayout>
	)
}

function CombatTurnBanner() {
	const room = useRoom()
	const characters = useCharacters()
	const isTurn =
		!room.isOwner && characters.find((c) => c._id === room.combat?.currentMemberId)?.isOwner
	return (
		<div
			className={panel(
				"flex-center fixed inset-x-0 top-20 mx-auto invisible max-w-sm translate-y-2 p-3 text-center opacity-0 shadow-md shadow-black/50 transition-all",
				isTurn && "translate-y-0 opacity-100 visible",
			)}
		>
			<h2 className="text-2xl font-light">It's your turn!</h2>
			<p>What will you do?</p>
		</div>
	)
}
