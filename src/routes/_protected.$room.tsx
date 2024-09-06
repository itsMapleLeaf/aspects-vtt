import * as Ariakit from "@ariakit/react"
import {
	DndContext,
	DragEndEvent,
	MouseSensor,
	pointerWithin,
	TouchSensor,
	useDndContext,
	useDraggable,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core"
import { useParams, useSearchParams } from "@remix-run/react"
import { useQuery } from "convex/react"
import { mapValues } from "lodash-es"
import {
	LucideImages,
	LucideMessageSquareText,
	LucideSidebarClose,
	LucideSidebarOpen,
	LucideUsers2,
} from "lucide-react"
import React from "react"
import * as v from "valibot"
import { api } from "../../convex/_generated/api.js"
import { Id } from "../../convex/_generated/dataModel"
import { BattleMap } from "../features/battlemap/BattleMap.tsx"
import { CharacterList } from "../features/characters/CharacterList.tsx"
import { SceneList } from "../features/scenes/SceneList.tsx"
import {
	useCssVar,
	useLocalStorage,
	useLocalStorageSwitch,
	useMediaQuery,
	usePointer,
} from "../lib/react.ts"
import { AppHeader } from "../ui/app-header.tsx"
import { Portal } from "../ui/portal.tsx"
import {
	clearButton,
	clearCircleButton,
	clearPanel,
	heading2xl,
} from "../ui/styles.ts"

type Sidebar = "left" | "right"

type PanelDefinition = {
	title: string
	icon: () => React.ReactNode
	content: (args: { roomId: Id<"rooms"> }) => React.ReactNode
	defaultLocation: PanelLocation
}

type PanelLocation = v.InferOutput<typeof panelLocationSchema>
const panelLocationSchema = v.object({
	sidebar: v.union([v.literal("left"), v.literal("right")]),
	group: v.number(),
})

type PanelId = keyof typeof PANELS

const PANELS = {
	characters: {
		title: "Characters",
		icon: () => <LucideUsers2 />,
		content: (args) => <CharacterList roomId={args.roomId} />,
		defaultLocation: {
			sidebar: "left",
			group: 0,
		},
	},
	scenes: {
		title: "Scenes",
		icon: () => <LucideImages />,
		content: (args) => <SceneList roomId={args.roomId} />,
		defaultLocation: {
			sidebar: "left",
			group: 0,
		},
	},
	chat: {
		title: "Chat",
		icon: () => <LucideMessageSquareText />,
		content: () => (
			<div className="h-full min-h-0 overflow-y-auto">
				<p className="h-[200vh]">Chat</p>
			</div>
		),
		defaultLocation: {
			sidebar: "right",
			group: 0,
		},
	},
} as const satisfies Record<string, PanelDefinition>

const defaultPanelLocations = mapValues(
	PANELS,
	(panel) => panel.defaultLocation,
)

export default function RoomRoute() {
	const params = useParams() as { room: Id<"rooms"> }

	const [searchParams] = useSearchParams()
	const previewSceneId = searchParams.get("preview")

	const room = useQuery(api.functions.rooms.getBySlug, {
		slug: params.room,
		previewSceneId,
	})

	const [panelLocations, setPanelLocations] = useLocalStorage<
		Record<string, PanelLocation>
	>("panelLocations", defaultPanelLocations, (data) =>
		v.parse(v.record(v.string(), panelLocationSchema), data),
	)

	const [leftSidebarOpen, leftSidebarActions] = useLocalStorageSwitch(
		"leftSidebar",
		true,
	)
	const [rightSidebarOpen, rightSidebarActions] = useLocalStorageSwitch(
		"rightSidebar",
		true,
	)

	const panelGroups = buildPanelGroups(panelLocations)

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
				<div className="natural-gradient pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary-900" />
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

function SidebarToggle({
	open,
	flipped,
	onClick,
}: {
	open: boolean
	flipped?: boolean
	onClick: () => void
}) {
	const Icon = open ? LucideSidebarClose : LucideSidebarOpen
	return (
		<button type="button" className={clearCircleButton()} onClick={onClick}>
			<Icon className={flipped ? "-scale-x-100" : ""} />
		</button>
	)
}

function PanelGroupList({
	sidebar,
	groups,
}: {
	sidebar: Sidebar
	groups: Array<{ group: number; panelIds: PanelId[] }>
}) {
	const firstGroup = groups[0]
	const lastGroup = groups.at(-1)
	return (
		<>
			{firstGroup && (
				<PanelGroupDroppableSpace
					sidebar={sidebar}
					group={firstGroup.group - 1}
				/>
			)}
			{groups.map(({ group, panelIds }) => (
				<PanelGroup
					key={group}
					group={group}
					sidebar={sidebar}
					panelIds={panelIds}
				/>
			))}
			{groups.length === 0 && <EmptyPanelGroup sidebar={sidebar} group={0} />}
			{lastGroup && (
				<PanelGroupDroppableSpace
					sidebar={sidebar}
					group={lastGroup.group + 1}
				/>
			)}
		</>
	)
}

function PanelGroup({
	sidebar,
	group,
	panelIds,
}: {
	sidebar: Sidebar
	group: number
	panelIds: PanelId[]
}) {
	const panels = panelIds.map((id) => ({ ...PANELS[id], id }))

	const droppable = useDroppable({
		id: `${group}-${sidebar}`,
		data: { group, sidebar },
	})

	return (
		<div
			data-over={droppable.isOver || undefined}
			className={clearPanel(
				"flex min-h-0 flex-1 flex-col data-[over]:bg-primary-700",
			)}
			ref={droppable.setNodeRef}
		>
			{panels.length === 0 ?
				null
			: panels.length === 1 && panels[0] ?
				<SinglePanel panel={panels[0]} />
			:	<MultiPanel panels={panels} storageKey={`${sidebar}:${group}`} />}
		</div>
	)
}

function SinglePanel({ panel }: { panel: PanelDefinition & { id: PanelId } }) {
	const params = useParams() as { room: Id<"rooms"> }
	const room = useQuery(api.functions.rooms.getBySlug, { slug: params.room })
	return (
		<>
			<div className="flex items-center justify-center p-2 opacity-50">
				<PanelLabel id={panel.id} icon={panel.icon()} title={panel.title} />
			</div>
			<div className="min-h-0 flex-1 p-3 pt-0">
				{room && panel.content({ roomId: room._id })}
			</div>
		</>
	)
}

function MultiPanel({
	panels,
	storageKey,
}: {
	panels: Array<PanelDefinition & { id: PanelId }>
	storageKey: string
}) {
	const params = useParams() as { room: Id<"rooms"> }
	const room = useQuery(api.functions.rooms.getBySlug, { slug: params.room })

	const [activeTabState, setActiveTab] = useLocalStorage<
		string | null | undefined
	>(`${storageKey}:activeTab`, panels[0]?.id, (data) =>
		v.parse(v.nullish(v.string()), data),
	)

	// ensure we always have an active tab
	const activeTab =
		(
			activeTabState != null &&
			panels.some((panel) => panel.id === activeTabState)
		) ?
			activeTabState
		:	panels[0]?.id

	return (
		<Ariakit.TabProvider activeId={activeTab} setActiveId={setActiveTab}>
			<Ariakit.TabList className="flex flex-wrap items-center justify-center p-2 gap-1">
				{panels.map((panel) => (
					<Ariakit.Tab
						key={panel.id}
						id={panel.id}
						className={clearButton(
							"px-0 opacity-50 data-[active-item]:bg-primary-600 data-[active-item]:opacity-100",
						)}
					>
						<PanelLabel id={panel.id} icon={panel.icon()} title={panel.title} />
					</Ariakit.Tab>
				))}
			</Ariakit.TabList>
			{panels.map((panel) => (
				<Ariakit.TabPanel
					key={panel.id}
					id={panel.id}
					className="min-h-0 flex-1 p-3 pt-0"
				>
					{room &&
						panel.content({
							roomId: room._id,
						})}
				</Ariakit.TabPanel>
			))}
		</Ariakit.TabProvider>
	)
}

function PanelLabel({
	id,
	icon,
	title,
}: {
	id: PanelId
	icon: React.ReactNode
	title: React.ReactNode
}) {
	const draggable = useDraggable({ id })
	const pointer = usePointer(draggable.isDragging)

	const content = (
		<div
			data-dragging={draggable.isDragging || undefined}
			className="relative flex h-10 items-center justify-center rounded px-3 will-change-transform gap-1.5 data-[dragging]:bg-primary-600"
		>
			{icon}
			<span
				className={heading2xl(
					"flex select-none flex-row items-center justify-center text-lg/tight font-medium text-primary-100 gap-1.5",
				)}
			>
				{title}
			</span>
		</div>
	)

	return (
		<>
			<div
				className={draggable.isDragging ? "invisible" : ""}
				{...draggable.attributes}
				{...draggable.listeners}
			>
				{content}
			</div>
			{draggable.isDragging && pointer && (
				<Portal>
					<div
						className="pointer-events-none fixed"
						ref={draggable.setNodeRef}
						style={{
							translate: `calc(${pointer.x}px - 50%) calc(${pointer.y}px - 50%)`,
						}}
					>
						{content}
					</div>
				</Portal>
			)}
		</>
	)
}

function EmptyPanelGroup({
	sidebar,
	group,
}: {
	sidebar: Sidebar
	group: number
}) {
	const droppable = useDroppable({
		id: `${group}-${sidebar}`,
		data: { group, sidebar },
	})

	return (
		<div
			data-over={droppable.isOver || undefined}
			className={clearPanel(
				"flex min-h-0 flex-1 flex-col data-[over]:bg-primary-700",
			)}
			ref={droppable.setNodeRef}
		>
			{droppable.isOver && <div className="h-full"></div>}
		</div>
	)
}

function PanelGroupDroppableSpace({
	sidebar,
	group,
}: {
	sidebar: Sidebar
	group: number
}) {
	const droppable = useDroppable({
		id: `${group}-${sidebar}`,
		data: { group, sidebar },
	})

	const context = useDndContext()

	if (!context.active) {
		return null
	}

	return (
		<div
			data-over={droppable.isOver || undefined}
			className="h-6 rounded bg-primary-800 transition-colors data-[over]:bg-primary-700"
			ref={droppable.setNodeRef}
		>
			{droppable.isOver && <div className="h-full"></div>}
		</div>
	)
}

function buildPanelGroups(panelLocations: Record<string, PanelLocation>) {
	const panelGroups: Record<Sidebar, Record<number, PanelId[]>> = {
		left: {},
		right: {},
	}

	for (const [id, panel] of Object.entries(panelLocations) as [
		PanelId,
		PanelLocation,
	][]) {
		const group = (panelGroups[panel.sidebar][panel.group] ??= [])
		group.push(id)
	}

	return mapValues(panelGroups, (groups) =>
		Object.entries(groups)
			.sort(([a], [b]) => Number(a) - Number(b))
			.map(([group, panelIds]) => ({ group: Number(group), panelIds })),
	)
}
