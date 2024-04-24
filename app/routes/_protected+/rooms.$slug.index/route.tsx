import {
	Disclosure,
	DisclosureContent,
	DisclosureProvider,
	useDisclosureStore,
} from "@ariakit/react"
import { UserButton } from "@clerk/remix"
import { useHref, useLocation } from "@remix-run/react"
import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { useEffect, useRef } from "react"
import { z } from "zod"
import { useMutationState } from "#app/common/convex.js"
import { expect } from "#app/common/expect.js"
import { useObservable } from "#app/common/observable.js"
import { useLocalStorageState } from "#app/common/useLocalStorage.js"
import { UploadedImage } from "#app/features/images/UploadedImage.js"
import { MessageForm } from "#app/features/messages/MessageForm.js"
import { MessageList } from "#app/features/messages/MessageList.js"
import { CanvasMap, defineCanvasMapDropData } from "#app/features/rooms/CanvasMap.js"
import { CombatInitiative } from "#app/features/rooms/CombatInitiative.js"
import { RoomOwnerOnly, useCharacters, useRoom } from "#app/features/rooms/roomContext.js"
import { AreaToolEnabled } from "#app/features/rooms/state.js"
import { SceneList } from "#app/features/scenes/SceneList.js"
import { useScene } from "#app/features/scenes/context.js"
import { SetMapBackgroundButton } from "#app/features/tokens/SetMapBackgroundButton.js"
import type { ViewportController } from "#app/features/tokens/TokenMapViewport.tsx"
import { AppHeader } from "#app/ui/AppHeader.js"
import { Button } from "#app/ui/Button.js"
import { DefinitionList } from "#app/ui/DefinitionList.js"
import { FormField, FormLayout, FormRow } from "#app/ui/Form.js"
import { Input } from "#app/ui/Input.js"
import { Modal, ModalButton, ModalPanel, ModalPanelContent } from "#app/ui/Modal.js"
import { ScrollArea } from "#app/ui/ScrollArea.js"
import { panel, translucentPanel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"
import { ValidatedInput } from "../../../ui/ValidatedInput"
import { Toolbar, ToolbarButton, ToolbarPopoverButton, ToolbarSeparator } from "./Toolbar"

export default function RoomIndexRoute() {
	const scene = useScene()
	const currentUrl = useHref(useLocation())
	const viewportRef = useRef<ViewportController>(null)
	return (
		<>
			<JoinRoomEffect />

			<div className="fixed inset-0 -z-10">{scene && <CanvasMap scene={scene} />}</div>

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

							<ToolbarSeparator />

							<DrawAreaButton />

							<ToolbarButton
								text="Reset View"
								icon={<Lucide.Compass />}
								onClick={() => viewportRef.current?.resetView()}
							/>

							<ToolbarSeparator />

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

			<h2 className="pointer-events-none fixed inset-x-0 top-16 mx-auto max-w-sm select-none text-pretty p-4 text-center text-2xl font-light opacity-50 drop-shadow-md">
				{scene?.name}
			</h2>

			<CharacterListPanel />
			<MessagesPanel />
			<CombatTurnBanner />
		</>
	)
}

function DrawAreaButton() {
	const enabled = useObservable(AreaToolEnabled)
	return (
		<ToolbarButton
			text="Draw Area"
			icon={<Lucide.SquareDashedMousePointer />}
			active={enabled}
			onClick={() => AreaToolEnabled.set(!enabled)}
		/>
	)
}

function CharacterListPanel() {
	const characters = useCharacters()
	return (
		<ToggleableSidebar name="Characters" side="left">
			<ScrollArea className={translucentPanel("h-full w-28 p-2")}>
				<ul className="flex h-full flex-col gap-3">
					{characters.map((character) => (
						<li key={character._id}>
							<button
								type="button"
								className="flex w-full flex-col items-stretch gap-2"
								draggable
								onDragStart={(event) => {
									const image = expect(
										event.currentTarget.querySelector("[data-image]"),
										"couldn't find drag image",
									)
									const rect = image.getBoundingClientRect()
									event.dataTransfer.setDragImage(image, rect.width / 2, rect.height / 2)
									event.dataTransfer.setData(
										"text/plain",
										JSON.stringify(
											defineCanvasMapDropData({
												characterId: character._id,
											}),
										),
									)
								}}
							>
								<div className={panel("overflow-clip aspect-square")} data-image>
									<UploadedImage id={character.imageId} emptyIcon={<Lucide.Ghost />} />
								</div>
								<p className="text-pretty text-center text-sm/none">{character.name}</p>
							</button>
						</li>
					))}
				</ul>
			</ScrollArea>
		</ToggleableSidebar>
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
		<ToggleableSidebar name="Messages & Dice" side="right">
			<aside className={translucentPanel("flex h-full w-80 flex-col gap-2 p-2")}>
				<MessageForm />
				<div className="min-h-0 flex-1">
					<MessageList />
				</div>
			</aside>
		</ToggleableSidebar>
	)
}

function ToggleableSidebar({
	name,
	side,
	children,
}: {
	name: string
	side: "left" | "right"
	children: React.ReactNode
}) {
	const [open, setOpen] = useLocalStorageState(`sidebar:${name}`, true, z.boolean().catch(true))
	const store = useDisclosureStore({ open, setOpen })
	const isOpen = store.useState("open")

	const Icon = isOpen ? Lucide.SidebarClose : Lucide.SidebarOpen
	return (
		<div
			data-side={side}
			className="group/sidebar-panel pointer-events-none fixed bottom-0 top-16 flex justify-end gap-2 p-2 *:pointer-events-auto data-[side=left]:left-0 data-[side=right]:right-0 data-[side=left]:flex-row-reverse"
		>
			<DisclosureProvider store={store}>
				<Button
					icon={<Icon className={side === "right" ? "-scale-x-100" : ""} />}
					className="shadow-md shadow-black/25"
					element={<Disclosure title={isOpen ? `Hide ${name}` : `Show ${name}`} />}
				/>
				<DisclosureContent
					className={translucentPanel(
						"h-full opacity-0 data-[enter]:opacity-100 transition data-[enter]:translate-x-0",
						side === "right" ? "translate-x-4" : "-translate-x-4",
					)}
				>
					{children}
				</DisclosureContent>
			</DisclosureProvider>
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
							<ValidatedInput
								id="cellSize"
								placeholder="70"
								className="w-20"
								value={updateSceneState.args?.cellSize ?? scene.cellSize}
								parse={(input) => {
									const value = Number(input)
									return Number.isInteger(value) && value >= 8 ? value : undefined
								}}
								onChangeValid={(value) => {
									updateScene({ id: scene._id, cellSize: value })
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
				<ValidatedInput
					placeholder="420"
					value={updateRoomState.args?.experience ?? room.experience}
					parse={(input) => {
						const value = Number(input)
						return Number.isInteger(value) && value >= 0 ? value : undefined
					}}
					onChangeValid={(value) => updateRoom({ id: room._id, experience: value })}
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
