import { mapValues } from "lodash-es"
import {
	LucideFolderTree,
	LucideMap,
	LucideMessageSquareText,
} from "lucide-react"
import { ReactNode, useState } from "react"
import * as v from "valibot"
import { api } from "../../../convex/_generated/api.js"
import { useStableQuery } from "../../lib/convex.tsx"
import {
	useCssVar,
	useDebouncedValue,
	useLocalStorage,
	useLocalStorageSwitch,
	useMediaQuery,
} from "../../lib/react.ts"
import { AppHeader } from "../../ui/app-header.tsx"
import { BattleMap } from "../battlemap/BattleMap.tsx"
import { CharacterAvatar } from "../characters/CharacterAvatar.tsx"
import { ResourceList } from "../resources/ResourceList.tsx"
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
	const [search, setSearch] = useState("")
	const debouncedSearch = useDebouncedValue(search, 400)

	const characters = useStableQuery(api.functions.characters.list, {
		roomId: room._id,
		search: debouncedSearch,
	})

	const scenes = useStableQuery(api.functions.scenes.list, {
		roomId: room._id,
		search: debouncedSearch,
	})

	const resources = [
		...(characters ?? []).map((character) => ({
			id: character._id,
			name: character.name,
			section: "Characters",
			icon: <CharacterAvatar character={character} className="bg-top" />,
		})),
		...(scenes ?? []).map((scene) => ({
			id: scene._id,
			name: scene.name,
			section: "Scenes",
			icon: <LucideMap />,
		})),
	]

	const panels: Record<string, PanelProperties> = {
		resources: {
			title: "Resources",
			icon: <LucideFolderTree />,
			content: (
				<ResourceList
					resources={resources}
					activeResourceId={resources[0]?.id}
					onSelectResource={(resource) => {
						console.log(resource)
					}}
					search={search}
					onSearchChange={setSearch}
				/>
			),
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
