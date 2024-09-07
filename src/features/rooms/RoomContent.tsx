import {
	DndContext,
	DragEndEvent,
	MouseSensor,
	pointerWithin,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core"
import { useQuery } from "convex/react"
import { mapValues } from "lodash-es"
import { LucideFolderTree, LucideMessageSquareText } from "lucide-react"
import * as v from "valibot"
import { api } from "../../../convex/_generated/api.js"
import {
	useCssVar,
	useLocalStorage,
	useLocalStorageSwitch,
	useMediaQuery,
} from "../../lib/react.ts"
import { AppHeader } from "../../ui/app-header.tsx"
import { BattleMap } from "../battlemap/BattleMap.tsx"
import { ResourceList } from "../resources/ResourceList.tsx"
import { PanelGroupList } from "./PanelGroupList.tsx"
import { buildPanelGroups } from "./panels.tsx"
import { SidebarToggle } from "./SidebarToggle.tsx"
import {
	ApiRoom,
	PanelLocation,
	panelLocationSchema,
	PanelProperties,
} from "./types.ts"

export function RoomContent({ room }: { room: ApiRoom }) {
	const characters = useQuery(api.functions.characters.list, {
		roomId: room._id,
	})

	const scenes = useQuery(api.functions.scenes.list, {
		roomId: room._id,
	})

	const panels: Record<string, PanelProperties> = {
		resources: {
			title: "Resources",
			icon: <LucideFolderTree />,
			content: (
				<ResourceList
					resources={[]}
					activeResourceId=""
					onSelectResource={() => {}}
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

	const [leftSidebarOpen, leftSidebarActions] = useLocalStorageSwitch(
		"leftSidebar",
		true,
	)
	const [rightSidebarOpen, rightSidebarActions] = useLocalStorageSwitch(
		"rightSidebar",
		true,
	)

	function handleDragEnd(event: DragEndEvent) {
		if (!event.over) return

		const data = v.parse(panelLocationSchema, event.over?.data.current)

		setPanelLocations((current) => ({
			...current,
			[event.active.id]: {
				sidebar: data.sidebar,
				group: data.group,
			},
		}))
	}

	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: { distance: 10 },
		}),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 250, tolerance: 5 },
		}),
	)

	const smallBreakpoint = useCssVar("--screens-lg")
	const isSmallScreen = useMediaQuery(`(max-width: ${smallBreakpoint})`)

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={pointerWithin}
			onDragEnd={handleDragEnd}
		>
			<div className="absolute inset-0 flex flex-col">
				{room?.activeScene == null ?
					undefined
				: (
					room.activeScene.mode === "scenery" &&
					room.activeScene.activeBackgroundUrl
				) ?
					<img
						src={room.activeScene.activeBackgroundUrl}
						alt=""
						className="absolute inset-0 size-full object-contain"
						draggable={false}
					/>
				:	<BattleMap scene={room.activeScene} />}
				<div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary-900 natural-gradient" />
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
							{panelGroups.left.length > 0 && (
								<PanelGroupList sidebar="left" groups={panelGroups.left} />
							)}
							{panelGroups.right.length > 0 && (
								<PanelGroupList sidebar="right" groups={panelGroups.right} />
							)}
						</div>
					)
				:	<div className="flex min-h-0 flex-1 p-3 pt-0 gap-3 *:w-80">
						{leftSidebarOpen && (
							<div className="flex flex-col gap-3">
								<PanelGroupList sidebar="left" groups={panelGroups.left} />
							</div>
						)}
						{rightSidebarOpen && (
							<div className="ml-auto flex flex-col gap-3">
								<PanelGroupList sidebar="right" groups={panelGroups.right} />
							</div>
						)}
					</div>
				}
			</div>
		</DndContext>
	)
}
