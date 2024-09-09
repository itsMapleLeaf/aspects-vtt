import { mapValues } from "lodash-es"
import {
	LucideImages,
	LucideMessageSquareText,
	LucideUsers,
} from "lucide-react"
import { ReactNode } from "react"
import * as v from "valibot"
import {
	useCssVar,
	useLocalStorage,
	useLocalStorageSwitch,
	useMediaQuery,
} from "../../lib/react.ts"
import { AppHeader } from "../../ui/app-header.tsx"
import { BattleMap } from "../battlemap/BattleMap.tsx"
import { CharacterList } from "../characters/CharacterList.tsx"
import { SceneList } from "../scenes/SceneList.tsx"
import { ApiScene } from "../scenes/types.ts"
import { SidebarToggle } from "./SidebarToggle.tsx"
import { buildPanelGroups } from "./panels.tsx"
import { PanelDndContext } from "./panels/PanelDndContext.tsx"
import { PanelGroupList } from "./panels/PanelGroupList.tsx"
import {
	ApiRoom,
	PanelLocation,
	PanelProperties,
	panelLocationSchema,
} from "./types.ts"

export function RoomRoot({ room }: { room: ApiRoom }) {
	const panels: Record<string, PanelProperties> = {
		scenes: {
			title: "Scenes",
			icon: <LucideImages />,
			content: <SceneList roomId={room._id} />,
			defaultLocation: {
				sidebar: "left",
				group: 0,
			},
		},
		characters: {
			title: "Characters",
			icon: <LucideUsers />,
			content: <CharacterList roomId={room._id} />,
			defaultLocation: {
				sidebar: "left",
				group: 0,
			},
		},
		chat: {
			title: "Chat",
			icon: <LucideMessageSquareText />,
			content: (
				<div className="h-full min-h-0 overflow-y-auto">
					<p className="h-[200vh]">Chat</p>
				</div>
			),
			defaultLocation: {
				sidebar: "right",
				group: 0,
			},
		},
	}

	return (
		<>
			<div className="pointer-events-none absolute inset-0 *:pointer-events-auto">
				{room.activeScene && <RoomSceneContent scene={room.activeScene} />}
			</div>
			<div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary-900 natural-gradient" />
			<div className="pointer-events-none absolute inset-0 *:pointer-events-auto">
				<RoomPanels panels={panels} />
			</div>
		</>
	)
}

function RoomSceneContent({ scene }: { scene: ApiScene }) {
	if (scene.mode === "battlemap") {
		return <BattleMap scene={scene} />
	}

	if (scene.activeBackgroundUrl) {
		return (
			<img
				src={scene.activeBackgroundUrl}
				alt=""
				className="size-full object-contain"
				draggable={false}
			/>
		)
	}

	return null
}

function RoomPanels({ panels }: { panels: Record<string, PanelProperties> }) {
	const defaultPanelLocations = mapValues(
		panels,
		(panel) => panel.defaultLocation,
	)

	const [panelLocations, setPanelLocations] = useLocalStorage<
		Record<string, PanelLocation>
	>("panelLocations", defaultPanelLocations, (data) =>
		v.parse(v.record(v.string(), panelLocationSchema), data),
	)

	const panelGroups = buildPanelGroups(panels, panelLocations)

	function handleMovePanel(panelId: string, location: PanelLocation) {
		setPanelLocations((prev) => ({
			...prev,
			[panelId]: location,
		}))
	}

	const leftSidebar = (
		<PanelGroupList sidebar="left" groups={panelGroups.left} />
	)

	const rightSidebar = (
		<PanelGroupList sidebar="right" groups={panelGroups.right} />
	)

	return (
		<PanelDndContext onMovePanel={handleMovePanel}>
			<RoomSidebarLayout
				leftSidebar={leftSidebar}
				rightSidebar={rightSidebar}
			/>
		</PanelDndContext>
	)
}

function RoomSidebarLayout({
	leftSidebar,
	rightSidebar,
}: {
	leftSidebar: ReactNode
	rightSidebar: ReactNode
}) {
	const [leftSidebarOpen, leftSidebarActions] = useLocalStorageSwitch(
		"leftSidebar",
		true,
	)
	const [rightSidebarOpen, rightSidebarActions] = useLocalStorageSwitch(
		"rightSidebar",
		true,
	)

	const smallBreakpoint = useCssVar("--screens-lg")
	const isSmallScreen = useMediaQuery(`(max-width: ${smallBreakpoint})`)

	return (
		<div className="flex size-full flex-col">
			<AppHeader
				className="relative"
				left={
					<SidebarToggle
						open={leftSidebarOpen}
						onClick={leftSidebarActions.toggle}
					/>
				}
				right={
					isSmallScreen ? null : (
						<SidebarToggle
							open={rightSidebarOpen}
							onClick={rightSidebarActions.toggle}
							flipped
						/>
					)
				}
			/>

			{isSmallScreen ?
				leftSidebarOpen && (
					<div className="flex min-h-0 w-80 flex-1 flex-col p-3 pt-0 gap-3">
						{leftSidebar}
						{rightSidebar}
					</div>
				)
			:	<div className="flex min-h-0 flex-1 p-3 pt-0 gap-3 *:w-80">
					{leftSidebarOpen && (
						<div className="flex flex-col gap-3">{leftSidebar}</div>
					)}
					{rightSidebarOpen && (
						<div className="ml-auto flex flex-col gap-3">{rightSidebar}</div>
					)}
				</div>
			}
		</div>
	)
}
