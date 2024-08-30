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
import { useParams } from "@remix-run/react"
import { useQuery } from "convex/react"
import { mapValues } from "lodash-es"
import {
	LucideImages,
	LucideMessageSquareText,
	LucideSidebarClose,
	LucideSidebarOpen,
	LucideUsers2,
} from "lucide-react"
import React, { useEffect, useState } from "react"
import * as v from "valibot"
import { api } from "../../convex/_generated/api.js"
import { useLocalStorage } from "../../lib/react.ts"
import { SceneList } from "../components/SceneList.tsx"
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
	content: () => React.ReactNode
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
		content: () => <p>Characters</p>,
		defaultLocation: {
			sidebar: "left",
			group: 0,
		},
	},
	scenes: {
		title: "Scenes",
		icon: () => <LucideImages />,
		content: () => <SceneList />,
		defaultLocation: {
			sidebar: "left",
			group: 0,
		},
	},
	chat: {
		title: "Chat",
		icon: () => <LucideMessageSquareText />,
		content: () => <p className="h-[200vh]">Chat</p>,
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
	const params = useParams() as { room: string }
	const room = useQuery(api.functions.rooms.getBySlug, { slug: params.room })

	const [panelLocations, setPanelLocations] = useLocalStorage<
		Record<string, PanelLocation>
	>("panelLocations", defaultPanelLocations, (data) =>
		v.parse(v.record(v.string(), panelLocationSchema), data),
	)
	const panelGroups = buildPanelGroups(panelLocations)

	const [openSidebars, setOpenSidebars] = useState({
		left: true,
		right: true,
	})

	function toggleSidebar(which: Sidebar) {
		setOpenSidebars((current) => ({ ...current, [which]: !current[which] }))
	}

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

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={pointerWithin}
			onDragEnd={handleDragEnd}
		>
			<div className="absolute inset-0 flex flex-col">
				<AppHeader
					left={
						<SidebarToggle
							open={openSidebars.left}
							onClick={() => toggleSidebar("left")}
						/>
					}
					right={
						<SidebarToggle
							open={openSidebars.right}
							onClick={() => toggleSidebar("right")}
							flipped
						/>
					}
				/>
				<div className="hidden min-h-0 flex-1 gap-3 p-3 pt-0 *:w-80 lg:flex">
					{openSidebars.left && (
						<div className="flex min-h-0 flex-col gap-3">
							<SidebarContent sidebar="left" groups={panelGroups.left} />
						</div>
					)}
					{openSidebars.right && (
						<div className="ml-auto flex min-h-0 flex-col gap-3">
							<SidebarContent sidebar="right" groups={panelGroups.right} />
						</div>
					)}
				</div>
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

function SidebarContent({
	sidebar,
	groups,
}: {
	sidebar: Sidebar
	groups: Array<{ group: number; element: React.ReactNode }>
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
			{groups.map(({ element }) => element)}
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
			{panels.length === 0 ? null : panels.length === 1 && panels[0] ? (
				<SinglePanel panel={panels[0]} />
			) : (
				<MultiPanel panels={panels} />
			)}
		</div>
	)
}

function SinglePanel({ panel }: { panel: PanelDefinition & { id: PanelId } }) {
	return (
		<>
			<div className="flex items-center justify-center p-2 opacity-50">
				<PanelLabel id={panel.id} icon={panel.icon()} title={panel.title} />
			</div>
			<div className="min-h-0 flex-1 overflow-y-auto p-3 pt-0">
				{panel.content()}
			</div>
		</>
	)
}

function MultiPanel({
	panels,
}: {
	panels: Array<PanelDefinition & { id: PanelId }>
}) {
	const [activeTabState, setActiveTab] = useState<string | null | undefined>()

	// ensure we always have an active tab
	const activeTab =
		activeTabState != null &&
		panels.some((panel) => panel.id === activeTabState)
			? activeTabState
			: panels[0]?.id

	return (
		<Ariakit.TabProvider activeId={activeTab} setActiveId={setActiveTab}>
			<Ariakit.TabList className="flex flex-wrap items-center justify-center gap-1 p-2">
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
					className="min-h-0 flex-1 overflow-y-auto rounded p-3 pt-0"
				>
					{panel.content()}
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
			className="relative flex h-10 items-center justify-center gap-1.5 rounded px-3 will-change-transform data-[dragging]:bg-primary-600"
		>
			{icon}
			<span
				className={heading2xl(
					"flex select-none flex-row items-center justify-center gap-1.5 text-lg/tight font-medium text-primary-100",
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

function buildPanelGroups(
	panelLocations: Record<string, PanelLocation> | null,
) {
	const panelGroups: Record<Sidebar, Record<number, PanelId[]>> = {
		left: {},
		right: {},
	}

	for (const [id, panel] of Object.entries(panelLocations ?? {}) as [
		PanelId,
		PanelLocation,
	][]) {
		const group = (panelGroups[panel.sidebar][panel.group] ??= [])
		group.push(id)
	}

	return mapValues(panelGroups, (groups, sidebar) =>
		Object.entries(groups)
			.sort(([a], [b]) => Number(a) - Number(b))
			.map(([group, panelIds]) => ({
				group: Number(group),
				element: (
					<PanelGroup
						key={group}
						sidebar={sidebar as Sidebar}
						group={Number(group)}
						panelIds={panelIds}
					/>
				),
			})),
	)
}

function usePointer(enabled = true) {
	const [pointer, setPointer] = useState<{ x: number; y: number }>()

	useEffect(() => {
		if (!enabled) return

		const handler = (event: PointerEvent) => {
			setPointer({ x: event.clientX, y: event.clientY })
		}

		const controller = new AbortController()

		window.addEventListener("pointerdown", handler, {
			signal: controller.signal,
		})

		window.addEventListener("pointermove", handler, {
			signal: controller.signal,
		})

		return () => controller.abort()
	}, [enabled])

	return pointer
}
