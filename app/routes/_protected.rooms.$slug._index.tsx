import { UserButton } from "@clerk/remix"
import { useHref, useLocation } from "@remix-run/react"
import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { useEffect } from "react"
import { api } from "../../convex/_generated/api.js"
import { useUser } from "../features/auth/UserContext.tsx"
import { CharacterListPanel } from "../features/characters/CharacterListPanel.tsx"
import { CharacterSelectionProvider } from "../features/characters/CharacterSelectionProvider.tsx"
import { GameTime } from "../features/game/GameTime.tsx"
import { MessageForm } from "../features/messages/MessageForm.tsx"
import { MessageList } from "../features/messages/MessageList.tsx"
import { CombatInitiative } from "../features/rooms/CombatInitiative.tsx"
import { RoomSettingsForm } from "../features/rooms/RoomSettingsForm.tsx"
import {
	Toolbar,
	ToolbarButton,
	ToolbarPopoverButton,
	ToolbarSeparator,
} from "../features/rooms/RoomToolbar.tsx"
import {
	RoomTool,
	RoomToolbarStore,
} from "../features/rooms/RoomToolbarStore.tsx"
import {
	RoomOwnerOnly,
	useCharacters,
	useRoom,
} from "../features/rooms/roomContext.tsx"
import { SceneProvider } from "../features/scenes/SceneContext.tsx"
import { SceneList } from "../features/scenes/SceneList.tsx"
import { SceneMap } from "../features/scenes/SceneMap.tsx"
import { AppHeader } from "../ui/AppHeader.tsx"
import { DefinitionList } from "../ui/DefinitionList.tsx"
import {
	ModalButton,
	ModalPanel,
	ModalPanelContent,
	ModalProvider,
} from "../ui/Modal.tsx"
import { ToggleableSidebar } from "../ui/ToggleableSidebar.tsx"
import { panel, translucentPanel } from "../ui/styles.ts"

export default function RoomRoute() {
	const currentUrl = useHref(useLocation())
	const room = useRoom()
	const scene = useQuery(api.scenes.functions.getCurrent, { roomId: room._id })

	const gameTime = new GameTime(room.gameTime)
	const themeColor = [
		145, // daytime
		70, // evening
		305, // night
	][gameTime.timeOfDay]

	useEffect(() => {
		if (themeColor !== undefined) {
			document.body.style.setProperty("--theme-hue", String(themeColor))
		}
	}, [themeColor])

	useEffect(() => {
		return () => {
			document.body.style.removeProperty("--theme-hue")
		}
	}, [])

	return (
		<div className="contents">
			<CharacterSelectionProvider>
				<JoinRoomEffect />
				<RoomToolbarStore.Provider>
					{scene && (
						<div className="fixed inset-0 -z-10 select-none bg-primary-100">
							<SceneProvider scene={scene}>
								<SceneMap />
							</SceneProvider>
						</div>
					)}
					<div
						className={translucentPanel(
							"flex h-16 flex-col justify-center rounded-none border-0 border-b px-4",
						)}
					>
						<AppHeader
							end={<UserButton afterSignOutUrl={currentUrl} />}
							center={<RoomToolbar />}
						/>
					</div>
				</RoomToolbarStore.Provider>
				<SceneHeading />
				<CharacterListPanel />
				<MessagesPanel />
				<CombatTurnBanner />
			</CharacterSelectionProvider>
		</div>
	)
}

function SceneHeading() {
	const room = useRoom()
	const scene = useQuery(api.scenes.functions.getCurrent, { roomId: room._id })
	const gameTime = new GameTime(room.gameTime)
	if (!scene) return
	return (
		<h2 className="pointer-events-none fixed inset-x-0 top-16 mx-auto max-w-sm select-none text-pretty p-4 text-center text-2xl font-light tracking-wide text-primary-900/90 drop-shadow-[0px_0px_3px_rgba(0,0,0,0.9)]">
			{scene.name}
			<p className="text-base font-medium tracking-wide">
				{gameTime.timeOfDayName} - Day {gameTime.day + 1} of{" "}
				{gameTime.monthName.name}, Year {gameTime.year + 1}
			</p>
		</h2>
	)
}

function RoomToolbar() {
	return (
		<Toolbar>
			<RoomOwnerOnly>
				<ModalProvider>
					<ModalButton
						render={<ToolbarButton text="Scenes" icon={<Lucide.Images />} />}
					/>
					<ModalPanel title="Scenes" className="max-w-screen-lg">
						<ModalPanelContent className="p-3">
							<SceneList />
						</ModalPanelContent>
					</ModalPanel>
				</ModalProvider>
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

			<ToolbarPopoverButton
				id="generalSkills"
				text="General Skills"
				icon={<Lucide.Hammer />}
			>
				<div className="p-4">
					<GeneralSkillsList />
				</div>
			</ToolbarPopoverButton>

			<ToolbarPopoverButton
				id="combatInfo"
				text="Combat Info"
				icon={<Lucide.Swords />}
			>
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
				<ToolbarPopoverButton
					id="settings"
					text="Settings"
					icon={<Lucide.Settings />}
				>
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
							description:
								"Subtract 1d12 movement each turn to a minimum of 1.",
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
				<h3 className="-mx-3 mb-3 border-y border-primary-300 bg-primary-100 p-4 text-lg font-bold">
					Fatigue
				</h3>
				<DefinitionList
					items={[
						{
							name: "Crippling Migraine",
							description:
								"You must take one fatigue before making any action.",
						},
						{
							name: "Panic Attack",
							description: "Immediately take 1d6 hits of fatigue.",
						},
						{
							name: "Neural Stunlock",
							description:
								"Double the modifier value of snag dice for intellect rolls.",
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
	const user = useUser()
	const join = useMutation(api.rooms.functions.join)
	const hasJoined = room.players.some((p) => p.clerkId === user?.clerkId)

	useEffect(() => {
		if (!hasJoined) join({ id: room._id })
	}, [room._id, join, hasJoined])

	return null
}

function MessagesPanel() {
	return (
		<ToggleableSidebar name="Messages & Dice" side="right">
			<aside
				className={translucentPanel("flex h-full w-[24rem] flex-col gap-2 p-2")}
			>
				<div className="min-h-0 flex-1">
					<MessageList />
				</div>
				<MessageForm />
			</aside>
		</ToggleableSidebar>
	)
}

function GeneralSkillsList() {
	const notionData = useQuery(api.notionImports.functions.get, {})
	return (
		<DefinitionList
			items={
				notionData?.generalSkills.toSorted((a, b) =>
					a.name.localeCompare(b.name),
				) ?? []
			}
		/>
	)
}

function CombatTurnBanner() {
	const room = useRoom()
	const characters = useCharacters()
	const isTurn =
		!room.isOwner &&
		characters.find((c) => c._id === room.combat?.currentMemberId)?.isOwner
	return (
		<div
			className={panel(
				"flex-center invisible fixed inset-x-0 top-20 mx-auto max-w-sm translate-y-2 p-3 text-center opacity-0 shadow-md shadow-black/50 transition-all",
				isTurn && "visible translate-y-0 opacity-100",
			)}
		>
			<h2 className="text-2xl font-light">It's your turn!</h2>
			<p>What will you do?</p>
		</div>
	)
}
