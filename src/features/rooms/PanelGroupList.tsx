import * as Ariakit from "@ariakit/react"
import { useDndContext, useDraggable, useDroppable } from "@dnd-kit/core"
import { useParams } from "@remix-run/react"
import { useQuery } from "convex/react"
import * as v from "valibot"
import { api } from "../../../convex/_generated/api.js"
import { Id } from "../../../convex/_generated/dataModel.js"
import { useLocalStorage, usePointer } from "../../lib/react.ts"
import { clearButton, clearPanel, heading2xl } from "../../ui/styles.ts"
import { Panel, Sidebar } from "./types.ts"

export function PanelGroupList({
	sidebar,
	groups,
}: {
	sidebar: Sidebar
	groups: Array<{ group: number; panels: Panel[] }>
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
			{groups.map(({ group, panels }) => (
				<PanelGroup
					key={group}
					group={group}
					sidebar={sidebar}
					panels={panels}
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
	panels,
}: {
	sidebar: Sidebar
	group: number
	panels: Panel[]
}) {
	const droppable = useDroppable({
		id: `${group}-${sidebar}`,
		data: { group, sidebar },
	})

	return (
		<div
			ref={droppable.setNodeRef}
			data-over={droppable.isOver || undefined}
			className={clearPanel(
				"flex min-h-0 flex-1 flex-col data-[over]:bg-primary-600",
			)}
		>
			{panels.length === 0 ?
				null
			: panels.length === 1 && panels[0] ?
				<SinglePanel panel={panels[0]} />
			:	<MultiPanel panels={panels} storageKey={`${sidebar}:${group}`} />}
		</div>
	)
}

function SinglePanel({ panel }: { panel: Panel }) {
	const params = useParams() as { room: Id<"rooms"> }
	const room = useQuery(api.functions.rooms.getBySlug, { slug: params.room })
	return (
		<>
			<div className="flex items-center justify-center p-2 opacity-50">
				<PanelLabel id={panel.id} icon={panel.icon} title={panel.title} />
			</div>
			<div className="min-h-0 flex-1 p-3 pt-0">{room && panel.content}</div>
		</>
	)
}

function MultiPanel({
	panels,
	storageKey,
}: {
	panels: Panel[]
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
						<PanelLabel id={panel.id} icon={panel.icon} title={panel.title} />
					</Ariakit.Tab>
				))}
			</Ariakit.TabList>
			{panels.map((panel) => (
				<Ariakit.TabPanel
					key={panel.id}
					id={panel.id}
					className="min-h-0 flex-1 p-3 pt-0"
				>
					{room && panel.content}
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
	id: string
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
				<Ariakit.Portal>
					<div
						className="pointer-events-none fixed"
						ref={draggable.setNodeRef}
						style={{
							translate: `calc(${pointer.x}px - 50%) calc(${pointer.y}px - 50%)`,
						}}
					>
						{content}
					</div>
				</Ariakit.Portal>
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
				"flex min-h-0 flex-1 flex-col data-[over]:bg-primary-600",
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
