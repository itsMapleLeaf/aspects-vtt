import { UserButton } from "@clerk/remix"
import { useHref, useLocation } from "@remix-run/react"
import { useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { useEffect } from "react"
import { api } from "../../convex/_generated/api.js"
import { CharacterListPanel } from "../features/characters/CharacterListPanel.tsx"
import { CharacterSelectionProvider } from "../features/characters/CharacterSelectionProvider.tsx"
import { PlayerControlsPanel } from "../features/characters/PlayerControlsPanel.tsx"
import { GameTime } from "../features/game/GameTime.tsx"
import { useNotionData } from "../features/game/NotionDataContext.tsx"
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
import { RoomTool, RoomToolbarStore } from "../features/rooms/RoomToolbarStore.tsx"
import { RoomOwnerOnly, useCharacters, useRoom } from "../features/rooms/roomContext.tsx"
import { SceneProvider } from "../features/scenes/SceneContext.tsx"
import { SceneList } from "../features/scenes/SceneList.tsx"
import { SceneMap } from "../features/scenes/SceneMap.tsx"
import { AppHeader } from "../ui/AppHeader.tsx"
import { DefinitionList } from "../ui/DefinitionList.tsx"
import { ModalButton, ModalPanel, ModalPanelContent, ModalProvider } from "../ui/Modal.tsx"
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

	const content = (
		<div className="contents">
			<CharacterSelectionProvider>
				<RoomToolbarStore.Provider>
					{scene && (
						<div className="fixed inset-0 select-none bg-primary-100">
							<SceneMap />
						</div>
					)}

					<div className="pointer-events-children flex h-screen flex-col">
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
						<div className="pointer-events-children flex min-h-0 flex-1 gap-2 p-2">
							<div className="flex-1">
								<CharacterListPanel />
							</div>
							<div className="flex items-end">
								<div className={translucentPanel("flex w-[40rem] flex-col gap-2 p-2")}>
									<PlayerControlsPanel />
								</div>
							</div>
							<div className="flex-1">
								<MessagesPanel />
							</div>
						</div>
					</div>

					<SceneHeading />
					<CombatTurnBanner />
				</RoomToolbarStore.Provider>
			</CharacterSelectionProvider>
		</div>
	)

	if (!scene) return content

	return <SceneProvider scene={scene}>{content}</SceneProvider>
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
				{gameTime.timeOfDayName} - Day {gameTime.day + 1} of {gameTime.monthName.name}, Year{" "}
				{gameTime.year + 1}
			</p>
		</h2>
	)
}

function RoomToolbar() {
	return (
		<Toolbar>
			<RoomOwnerOnly>
				<ModalProvider>
					<ModalButton render={<ToolbarButton text="Scenes" icon={<Lucide.Images />} />} />
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

function MessagesPanel() {
	return (
		<ToggleableSidebar name="Messages & Dice" side="right">
			<aside className={translucentPanel("flex h-full w-[24rem] flex-col gap-2 p-2")}>
				<div className="min-h-0 flex-1">
					<MessageList />
				</div>
				<MessageForm />
			</aside>
		</ToggleableSidebar>
	)
}

function GeneralSkillsList() {
	const notionData = useNotionData()
	return (
		<DefinitionList
			items={notionData?.generalSkills.toSorted((a, b) => a.name.localeCompare(b.name)) ?? []}
		/>
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
				"flex-center invisible fixed inset-x-0 top-20 mx-auto max-w-sm translate-y-2 p-3 text-center opacity-0 shadow-md shadow-black/50 transition-all",
				isTurn && "visible translate-y-0 opacity-100",
			)}
		>
			<h2 className="text-2xl font-light">It's your turn!</h2>
			<p>What will you do?</p>
		</div>
	)
}
