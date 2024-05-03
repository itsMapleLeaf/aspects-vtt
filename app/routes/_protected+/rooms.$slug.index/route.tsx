import { UserButton } from "@clerk/remix"
import { useHref, useLocation } from "@remix-run/react"
import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { useEffect } from "react"
import { api } from "../../../../convex/_generated/api.js"
import { useMutationState } from "../../../common/convex.ts"
import { CharacterListPanel } from "../../../features/characters/CharacterListPanel.tsx"
import { CharacterSelectionProvider } from "../../../features/characters/CharacterSelectionProvider"
import { MessageForm } from "../../../features/messages/MessageForm.tsx"
import { MessageList } from "../../../features/messages/MessageList.tsx"
import { CombatInitiative } from "../../../features/rooms/CombatInitiative.tsx"
import { RoomTool, RoomToolbarStore } from "../../../features/rooms/RoomToolbarStore.tsx"
import { RoomOwnerOnly, useCharacters, useRoom } from "../../../features/rooms/roomContext.tsx"
import { SceneList } from "../../../features/scenes/SceneList.tsx"
import { SceneMapBackground } from "../../../features/scenes/SceneMapBackground.tsx"
import { SceneGrid } from "../../../features/scenes/grid.tsx"
import { SceneTokens } from "../../../features/scenes/tokens.tsx"
import { ViewportStore } from "../../../features/scenes/viewport.tsx"
import { ViewportDragInput } from "../../../features/scenes/viewport.tsx"
import { ViewportWheelInput } from "../../../features/scenes/viewport.tsx"
import { SetMapBackgroundButton } from "../../../features/tokens/SetMapBackgroundButton.tsx"
import { AppHeader } from "../../../ui/AppHeader.tsx"
import { DefinitionList } from "../../../ui/DefinitionList.tsx"
import { FormField, FormLayout, FormRow } from "../../../ui/Form.tsx"
import { Input } from "../../../ui/Input.tsx"
import { Modal, ModalButton, ModalPanel, ModalPanelContent } from "../../../ui/Modal.tsx"
import { ToggleableSidebar } from "../../../ui/ToggleableSidebar.tsx"
import { ValidatedInput } from "../../../ui/ValidatedInput"
import { panel, translucentPanel } from "../../../ui/styles.ts"
import { Toolbar, ToolbarButton, ToolbarPopoverButton, ToolbarSeparator } from "./Toolbar"

export default function RoomIndexRoute() {
	const currentUrl = useHref(useLocation())
	const room = useRoom()
	const scene = useQuery(api.scenes.getCurrent, { roomId: room._id })
	return (
		<CharacterSelectionProvider>
			<JoinRoomEffect />
			<ViewportStore.Provider>
				<RoomToolbarStore.Provider>
					{scene && (
						<div className="fixed inset-0 -z-10 select-none">
							<ViewportWheelInput>
								<SceneMapBackground scene={scene} />
								<SceneGrid scene={scene} />
								<ViewportDragInput>
									<SceneTokens scene={scene} />
								</ViewportDragInput>
							</ViewportWheelInput>
						</div>
					)}
					<div
						className={translucentPanel(
							"px-4 rounded-none border-0 border-b h-16 flex flex-col justify-center",
						)}
					>
						<AppHeader end={<UserButton afterSignOutUrl={currentUrl} />} center={<RoomToolbar />} />
					</div>
				</RoomToolbarStore.Provider>
				<SceneHeading />
				<CharacterListPanel />
				<MessagesPanel />
				<CombatTurnBanner />
			</ViewportStore.Provider>
		</CharacterSelectionProvider>
	)
}

function SceneHeading() {
	const room = useRoom()
	const scene = useQuery(api.scenes.getCurrent, { roomId: room._id })
	if (!scene) return
	return (
		<h2 className="pointer-events-none fixed inset-x-0 top-16 mx-auto max-w-sm select-none text-pretty p-4 text-center text-2xl font-light opacity-50 drop-shadow-md">
			{scene.name}
		</h2>
	)
}

function RoomToolbar() {
	return (
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

			<AreaToolButton />

			{/* <ToolbarButton
				text="Reset View"
				icon={<Lucide.Compass />}
				onClick={() => {
					// todo
				}}
			/> */}

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

			<ToolbarPopoverButton id="generalSkills" text="General Skills" icon={<Lucide.Hammer />}>
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
	)
}

function AreaToolButton() {
	const state = RoomToolbarStore.useState()
	const actions = RoomToolbarStore.useActions()
	return (
		<ToolbarButton
			text="Draw Area"
			icon={<Lucide.SquareDashedMousePointer />}
			active={state.activeTool === RoomTool.Draw}
			onClick={actions.toggleDrawTool}
		/>
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
			<aside className={translucentPanel("flex h-full w-[24rem] flex-col gap-2 p-2")}>
				<MessageForm />
				<div className="min-h-0 flex-1">
					<MessageList />
				</div>
			</aside>
		</ToggleableSidebar>
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
	const scene = useQuery(api.scenes.getCurrent, { roomId: room._id })
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
