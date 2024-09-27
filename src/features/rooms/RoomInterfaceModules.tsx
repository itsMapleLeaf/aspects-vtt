import * as Ariakit from "@ariakit/react"
import {
	draggable,
	dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { Iterator } from "iterator-helpers-polyfill"
import {
	LucideMessageCircle,
	LucidePackage,
	LucideShield,
	LucideUsers2,
} from "lucide-react"
import { Fragment, useEffect, useRef, useState } from "react"
import * as v from "valibot"
import { useLocalStorage } from "~/common/react/dom.ts"
import { Button } from "~/components/Button.tsx"
import { panel } from "~/styles/panel.ts"
import { CharacterList } from "../characters/CharacterList.tsx"
import { CombatTracker } from "../combat/CombatTracker.tsx"
import { RoomItemList } from "../inventory/RoomItemList.tsx"
import { MessageList } from "../messages/MessageList.tsx"

interface ModuleDefinition {
	name: string
	icon: React.ReactNode
	defaultLocation: ModuleLocation
	content: () => React.ReactNode
}

interface ModuleLocation {
	sidebar: number
	panel: number
}

const MODULES: Record<string, ModuleDefinition> = {
	characters: {
		name: "Characters",
		icon: <LucideUsers2 />,
		defaultLocation: { sidebar: 0, panel: 0 },
		content: () => <CharacterList />,
	},
	messages: {
		name: "Messages",
		icon: <LucideMessageCircle />,
		defaultLocation: { sidebar: 1, panel: 1 },
		content: () => <MessageList />,
	},
	items: {
		name: "Items",
		icon: <LucidePackage />,
		defaultLocation: { sidebar: 0, panel: 1 },
		content: () => <RoomItemList />,
	},
	combat: {
		name: "Combat",
		icon: <LucideShield />,
		defaultLocation: { sidebar: 1, panel: 0 },
		content: () => <CombatTracker />,
	},
	// notes: {
	// 	name: "Notes",
	// 	icon: <LucideNotebookPen />,
	// 	defaultLocation: { sidebar: 0, panel: 0 },
	// 	content: () => <p>notes</p>,
	// },
}

const moduleLocationsParser = v.parser(
	v.record(
		v.string(),
		v.object({
			sidebar: v.number(),
			panel: v.number(),
		}),
	),
)

export function RoomInterfaceModules() {
	const [moduleLocations, setModuleLocations] = useLocalStorage<
		Record<string, ModuleLocation>
	>("room:moduleLocations", {}, moduleLocationsParser)

	const handleModuleDrop = (event: {
		moduleId: string
		sidebarIndex: number
		panelIndex: number
	}) => {
		setModuleLocations((locations) => {
			const updatedLocations: Record<string, ModuleLocation> = {
				...locations,
				[event.moduleId]: {
					sidebar: event.sidebarIndex,
					panel: event.panelIndex,
				},
			}

			const tree = new Map<number, Map<number, string[]>>()
			for (const [moduleId, location] of Object.entries(updatedLocations)) {
				let sidebar = tree.get(location.sidebar)
				if (!sidebar) {
					sidebar = new Map()
					tree.set(location.sidebar, sidebar)
				}
				let panel = sidebar.get(location.panel)
				if (!panel) {
					panel = []
					sidebar.set(location.panel, panel)
				}
				panel.push(moduleId)
			}

			// i'm very sorry
			const normalizedLocations: Record<string, ModuleLocation> = {}
			for (const [sidebarIndex, sidebarPanels] of [...tree].sort(
				(a, b) => a[0] - b[0],
			)) {
				for (const [panelIndex, [, moduleIds]] of [...sidebarPanels]
					.sort((a, b) => a[0] - b[0])
					.entries()) {
					for (const moduleId of moduleIds) {
						normalizedLocations[moduleId] = {
							sidebar: sidebarIndex,
							panel: panelIndex,
						}
					}
				}
			}
			return normalizedLocations
		})
	}

	return (
		<>
			<Sidebar
				aria-label="Left sidebar"
				index={0}
				moduleLocations={moduleLocations}
				onModuleDrop={handleModuleDrop}
			/>
			<Sidebar
				aria-label="Right sidebar"
				index={1}
				moduleLocations={moduleLocations}
				onModuleDrop={handleModuleDrop}
			/>
		</>
	)
}

function Sidebar({
	index: sidebarIndex,
	moduleLocations,
	onModuleDrop,
	...props
}: {
	index: number
	moduleLocations: Record<string, ModuleLocation>
	onModuleDrop: (event: {
		moduleId: string
		sidebarIndex: number
		panelIndex: number
	}) => void
}) {
	const presentModules = Object.entries(MODULES)
		.map(([id, module]) => ({
			id,
			location: moduleLocations[id] ?? module.defaultLocation,
		}))
		.filter(({ location }) => location.sidebar === sidebarIndex)

	const lowestPanelIndex =
		presentModules.length > 0
			? Math.min(...presentModules.map(({ location }) => location.panel))
			: 0
	const highestPanelIndex =
		presentModules.length > 0
			? Math.max(...presentModules.map(({ location }) => location.panel))
			: 0

	return (
		<div className="flex h-full flex-col gap-1" {...props}>
			<SidebarPanelSpaceDroppable
				onDrop={({ moduleId }) => {
					onModuleDrop({
						moduleId,
						sidebarIndex,
						panelIndex: lowestPanelIndex - 1,
					})
				}}
			/>
			{Iterator.range(lowestPanelIndex, highestPanelIndex, 1, true)
				.map((panelIndex) => (
					<Fragment key={panelIndex}>
						<SidebarPanel
							onModuleDrop={({ moduleId }) => {
								onModuleDrop({
									moduleId,
									sidebarIndex,
									panelIndex,
								})
							}}
							moduleIds={presentModules
								.filter(({ location }) => location.panel === panelIndex)
								.map(({ id }) => id)}
						/>
						<SidebarPanelSpaceDroppable
							onDrop={({ moduleId }) => {
								onModuleDrop({
									moduleId,
									sidebarIndex,
									panelIndex: panelIndex + 0.5,
								})
							}}
						/>
					</Fragment>
				))
				.toArray()}
		</div>
	)
}

function SidebarPanel({
	moduleIds,
	onModuleDrop,
}: {
	moduleIds: string[]
	onModuleDrop: (event: { moduleId: string }) => void
}) {
	const modules = moduleIds.flatMap((id) =>
		MODULES[id] ? [{ ...MODULES[id], id }] : [],
	)

	const [selectedId, setSelectedId] = useState<string | null>()
	const selectedModule =
		modules.find((it) => it.id === selectedId) ?? modules[0]

	const ref = useRef<HTMLDivElement>(null)
	const [over, setOver] = useState(false)

	useEffect(() => {
		return dropTargetForElements({
			element: ref.current!,
			onDragEnter: () => setOver(true),
			onDragLeave: () => setOver(false),
			onDrop(args) {
				setOver(false)
				onModuleDrop({
					moduleId: args.source.data.moduleId as string,
				})
			},
		})
	})

	return (
		<div
			className={panel(
				"flex min-h-0 flex-1 flex-col p-2 shadow shadow-primary-900/75 transition gap-2",
				over && "border-accent-500",
			)}
			ref={ref}
		>
			<Ariakit.TabProvider
				selectedId={selectedModule?.id}
				setSelectedId={setSelectedId}
			>
				<div className="flex flex-wrap justify-center gap">
					{modules.map((module) => (
						<ModuleHandle
							key={module.id}
							moduleId={module.id}
							name={module.name}
							icon={module.icon}
						/>
					))}
				</div>
				{modules.map((module) => (
					<Ariakit.TabPanel
						key={module.id}
						id={module.id}
						className="min-h-0 flex-1"
					>
						{module.content()}
					</Ariakit.TabPanel>
				))}
			</Ariakit.TabProvider>
		</div>
	)
}

function SidebarPanelSpaceDroppable({
	onDrop,
}: {
	onDrop: (event: { moduleId: string }) => void
}) {
	const ref = useRef<HTMLDivElement>(null)
	const [over, setOver] = useState(false)

	useEffect(() => {
		return dropTargetForElements({
			element: ref.current!,
			onDragEnter: () => setOver(true),
			onDragLeave: () => setOver(false),
			onDrop: (args) => {
				setOver(false)
				onDrop({ moduleId: args.source.data.moduleId as string })
			},
		})
	})

	return (
		<div className="relative">
			<div className="absolute -inset-y-3 inset-x-0" ref={ref} />
			<div
				data-visible={over || undefined}
				className="pointer-events-none absolute -inset-y-px inset-x-0 rounded-full bg-accent-500 opacity-0 transition-opacity data-[visible]:opacity-100"
			/>
		</div>
	)
}

function ModuleHandle({
	moduleId,
	name,
	icon,
}: {
	moduleId: string
	name: string
	icon: React.ReactNode
}) {
	const context = Ariakit.useTabContext()
	const selected = Ariakit.useStoreState(
		context,
		(state) => state?.selectedId === moduleId,
	)

	const ref = useRef<HTMLButtonElement>(null)
	const [dragging, setDragging] = useState(false)

	useEffect(() => {
		return draggable({
			element: ref.current!,
			getInitialData: () => ({ moduleId }),
			onDragStart: () => setDragging(true),
			onDrop: () => setDragging(false),
		})
	})

	return (
		<Button
			size="small"
			appearance={selected ? "solid" : "clear"}
			icon={icon}
			ref={ref}
			asChild
			className={dragging ? "invisible" : ""}
		>
			<Ariakit.Tab id={moduleId}>{name}</Ariakit.Tab>
		</Button>
	)
}
