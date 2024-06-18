import { useNavigate, useParams } from "@remix-run/react"
import { useQuery } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import { useCallback, useEffect, useRef, type RefObject } from "react"
import { api } from "../../../../../convex/_generated/api.js"
import { CharacterListPanel } from "../../../../modules/characters/CharacterListPanel.tsx"
import { CharacterSelectionProvider } from "../../../../modules/characters/CharacterSelectionProvider.tsx"
import { GameTime } from "../../../../modules/game/GameTime.tsx"
import { listGeneralSkills } from "../../../../modules/general-skills/data.ts"
import { MessageInput } from "../../../../modules/messages/MessageInput.tsx"
import { MessageList } from "../../../../modules/messages/MessageList.tsx"
import { PlayerControlsPanel } from "../../../../modules/player/PlayerControlsPanel.tsx"
import { CombatInitiative } from "../../../../modules/rooms/CombatInitiative.tsx"
import { RoomOwnerOnly, useCharacters, useRoom } from "../../../../modules/rooms/roomContext.tsx"
import { RoomSettingsForm } from "../../../../modules/rooms/RoomSettingsForm.tsx"
import {
	Toolbar,
	ToolbarButton,
	ToolbarPopoverButton,
	ToolbarSeparator,
} from "../../../../modules/rooms/RoomToolbar.tsx"
import { RoomTool, RoomToolbarStore } from "../../../../modules/rooms/RoomToolbarStore.tsx"
import { SceneProvider } from "../../../../modules/scenes/SceneContext.tsx"
import { SceneList } from "../../../../modules/scenes/SceneList.tsx"
import { SceneMap } from "../../../../modules/scenes/SceneMap.tsx"
import { AppHeader } from "../../../../ui/AppHeader.tsx"
import { DefinitionList } from "../../../../ui/DefinitionList.tsx"
import { ModalButton, ModalPanel, ModalPanelContent, ModalProvider } from "../../../../ui/Modal.tsx"
import { Panel, TranslucentPanel } from "../../../../ui/Panel.tsx"
import { Popover, PopoverPanel, PopoverTrigger } from "../../../../ui/Popover.tsx"
import { ScrollArea } from "../../../../ui/ScrollArea.tsx"
import { panel } from "../../../../ui/styles.ts"

const views = {
	characters: "characters",
} as const

export default function RoomRoute() {
	const room = useRoom()
	const scene = useQuery(api.scenes.functions.getCurrent, { roomId: room._id })
	const { view } = useParams()
	const navigate = useNavigate()

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
		<CharacterSelectionProvider>
			<RoomToolbarStore.Provider>
				{scene && (
					<div className="fixed inset-0 select-none bg-primary-100">
						<SceneProvider scene={scene}>
							<SceneMap />
						</SceneProvider>
					</div>
				)}

				<div className="pointer-events-none fixed inset-x-0 top-0 z-10 h-40 bg-natural-gradient-100">
					<div className="absolute inset-x-0 top-0 flex flex-col justify-center p-4 [&_:is(a,button)]:pointer-events-auto">
						<AppHeader />
					</div>
					<div className="flex-center absolute inset-x-0 top-6"></div>
					<SceneHeading />
					<CombatTurnBanner />
				</div>

				<div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-screen items-end gap-2 overflow-clip p-2">
					<div className="h-[calc(100%-4rem)] min-h-0 flex-1">
						<TranslucentPanel className="pointer-events-auto h-full w-28 p-1">
							<CharacterListPanel />
						</TranslucentPanel>
					</div>

					<TranslucentPanel className="pointer-events-auto flex flex-col items-center gap-2 p-2">
						<RoomToolbar />
						<PlayerControlsPanel />
					</TranslucentPanel>

					<div className="flex h-full min-h-0 flex-1 flex-col items-end justify-end">
						<div className="flex min-h-0 flex-1 flex-col justify-end">
							<MessageListScroller />
						</div>
						<div className="flex w-[20rem] flex-col gap-2">
							<TranslucentPanel element={<aside />} className="pointer-events-auto gap-2 p-2">
								<MessageInput />
							</TranslucentPanel>
							{/* <PlayerControlsPanel /> */}
						</div>
					</div>
				</div>

				<ModalPanel
					title="Characters"
					className="max-w-screen-md"
					open={view === views.characters}
					onClose={() => navigate("..")}
				>
					test
				</ModalPanel>
			</RoomToolbarStore.Provider>
		</CharacterSelectionProvider>
	)
}

function MessageListScroller() {
	const viewportRef = useRef<HTMLDivElement>(null)

	const handleMessageAdded = useCallback(() => {
		const viewport = viewportRef.current
		if (!viewport) return

		setTimeout(() => {
			viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" })
		}, 300) // wait for
	}, [])

	return (
		<ScrollArea
			className="pointer-events-auto -mr-2 w-[21rem]"
			viewportRef={viewportRef}
			scrollbarPosition="inside"
		>
			<div className="p-2">
				<MessageList onMessageAdded={handleMessageAdded} />
			</div>
		</ScrollArea>
	)
}

function SceneHeading() {
	const room = useRoom()
	const scene = useQuery(api.scenes.functions.getCurrent, { roomId: room._id })
	const gameTime = new GameTime(room.gameTime)
	if (!scene) return
	return (
		<h2 className="pointer-events-none fixed inset-x-0 top-3 mx-auto max-w-sm select-none text-pretty p-4 text-center text-2xl font-light tracking-wide text-primary-900/90 drop-shadow-[0px_0px_3px_rgba(0,0,0,0.9)]">
			{scene.name}
			<p className="text-base font-medium tracking-wide">
				{gameTime.timeOfDayName} - Day {gameTime.day + 1} of {gameTime.monthName.name}, Year{" "}
				{gameTime.year + 1}
			</p>
		</h2>
	)
}

function RoomToolbar() {
	const toolbarRef = useRef<HTMLElement>(null)
	return (
		<Toolbar ref={toolbarRef}>
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

function CharacterListToolbarButton({ toolbarRef }: { toolbarRef: RefObject<HTMLElement> }) {
	return (
		<Popover>
			<PopoverTrigger render={<ToolbarButton icon={<Lucide.Users />} text="Characters" />} />
			<PopoverPanel
				getAnchorRect={() => toolbarRef.current?.getBoundingClientRect() ?? null}
				className="w-[calc(100vw-4rem)] max-w-screen-md p-2"
			>
				<ScrollArea scrollbarPosition="outside" className="size-full" wheelDirection="horizontal">
					<div className="grid h-24 grid-flow-col gap-2">
						{Iterator.range(64)
							.map((i) => (
								<Panel key={i} className="aspect-square">
									Character {i}
								</Panel>
							))
							.toArray()}
					</div>
				</ScrollArea>
			</PopoverPanel>
		</Popover>
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

function GeneralSkillsList() {
	return (
		<DefinitionList
			items={[...listGeneralSkills()].toSorted((a, b) => a.name.localeCompare(b.name)) ?? []}
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
				"flex-center invisible fixed inset-x-0 top-20 mx-auto max-w-sm translate-y-2 p-3 text-center opacity-0 shadow-md transition-all",
				isTurn && "visible translate-y-0 opacity-100",
			)}
		>
			<h2 className="text-2xl font-light">It's your turn!</h2>
			<p>What will you do?</p>
		</div>
	)
}
