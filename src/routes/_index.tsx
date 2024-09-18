import {
	draggable,
	dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { useQuery } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import {
	LucideFileText,
	LucideMessageCircle,
	LucideShield,
	LucideUsers2,
} from "lucide-react"
import { Fragment, useEffect, useRef, useState } from "react"
import { Heading, HeadingLevel } from "~/common/react/heading.tsx"
import { Button } from "~/components/Button.tsx"
import { LoadingCover } from "~/components/LoadingCover.tsx"
import { LoadingIcon } from "~/components/LoadingIcon.tsx"
import { api } from "~/convex/_generated/api.js"
import type { Id } from "~/convex/_generated/dataModel.js"
import { Battlemap } from "~/features/battlemap/Battlemap.tsx"
import { CharacterCard } from "~/features/characters/CharacterCard.tsx"
import { panel } from "~/styles/panel.ts"
import { Avatar, AvatarFallback } from "~/ui/avatar.tsx"
import { heading } from "~/ui/styles.ts"

export default function RoomRoute() {
	const room = useQuery(api.entities.rooms.list)?.[0]
	return (
		<>
			{room && <RoomBackground roomId={room._id} />}
			<div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary-900" />
			{room && <RoomInterface roomId={room._id} />}
			<LoadingCover visible={room === undefined} />
		</>
	)
}

function RoomInterface({ roomId }: { roomId: Id<"rooms"> }) {
	return (
		<div className="pointer-events-children absolute inset-0 flex flex-col p-3 gap-3">
			<HeadingLevel>
				<header className="pointer-events-children flex items-center justify-between">
					<Heading className={heading()}>AspectsVTT</Heading>
					<button>
						<Avatar>
							<AvatarFallback>M</AvatarFallback>
						</Avatar>
					</button>
					<ActiveSceneHeading roomId={roomId} />
				</header>

				<main className="pointer-events-children flex flex-1 items-stretch justify-between *:w-72">
					<RoomSidebars roomId={roomId} />
				</main>
			</HeadingLevel>
		</div>
	)
}

function ActiveSceneHeading({ roomId }: { roomId: Id<"rooms"> }) {
	const activeScene = useQuery(api.entities.scenes.getActive, { roomId })
	return activeScene ?
			<HeadingLevel>
				<div className="pointer-events-children absolute inset-x-0 top-6 flex flex-col items-center animate-in fade-in">
					<Heading className="text-3xl font-light">{activeScene.name}</Heading>
					<p className="text-xl font-light">Harvest 24th, 365 &bull; Evening</p>
					<p className="text-xl font-light">(weather)</p>
				</div>
			</HeadingLevel>
		:	null
}

interface ModuleDefinition {
	name: string
	icon: React.ReactNode
	defaultLocation: ModuleLocation
}

interface ModuleLocation {
	sidebar: number
	panel: number
}

const modules: Record<string, ModuleDefinition> = {
	characters: {
		name: "Characters",
		icon: <LucideUsers2 className="size-4" />,
		defaultLocation: { sidebar: 0, panel: 0 },
	},
	notes: {
		name: "Notes",
		icon: <LucideFileText className="size-4" />,
		defaultLocation: { sidebar: 0, panel: 0 },
	},
	combat: {
		name: "Combat",
		icon: <LucideShield className="size-4" />,
		defaultLocation: { sidebar: 1, panel: 0 },
	},
	messages: {
		name: "Messages",
		icon: <LucideMessageCircle className="size-4" />,
		defaultLocation: { sidebar: 1, panel: 1 },
	},
}

function RoomSidebars({ roomId }: { roomId: Id<"rooms"> }) {
	const [moduleLocations, setModuleLocations] = useState<
		Record<string, ModuleLocation>
	>({})

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
	const presentModules = Object.entries(modules)
		.map(([id, module]) => ({
			id,
			location: moduleLocations[id] ?? module.defaultLocation,
		}))
		.filter(({ location }) => location.sidebar === sidebarIndex)

	const lowestPanelIndex =
		presentModules.length > 0 ?
			Math.min(...presentModules.map(({ location }) => location.panel))
		:	0
	const highestPanelIndex =
		presentModules.length > 0 ?
			Math.max(...presentModules.map(({ location }) => location.panel))
		:	0

	return (
		<div className="flex flex-col gap-2" {...props}>
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
				"flex flex-1 flex-col p-2 transition gap",
				over && "border-accent-500",
			)}
			ref={ref}
		>
			<div className="flex flex-wrap justify-center gap">
				{moduleIds.map((moduleId) => {
					const module = modules[moduleId]
					if (!module) return null
					return (
						<ModuleHandle
							key={moduleId}
							moduleId={moduleId}
							name={module.name}
							icon={module.icon}
						/>
					)
				})}
			</div>
			<p>content</p>
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
		<div className="relative -my-1 first:-mb-2 last:-mt-2">
			<div className="absolute -inset-y-2 inset-x-0" ref={ref} />
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
	const ref = useRef<HTMLButtonElement>(null)

	useEffect(() => {
		return draggable({
			element: ref.current!,
			getInitialData: () => ({ moduleId }),
		})
	})

	return (
		<Button size="small" appearance="clear" icon={icon} ref={ref}>
			{name}
		</Button>
	)
}

function CharacterList({ roomId }: { roomId: Id<"rooms"> }) {
	const characters = useQuery(
		api.entities.characters.list,
		roomId ? { roomId } : "skip",
	)

	return characters === undefined ?
			<div className="flex flex-col items-center py-8">
				<LoadingIcon />
			</div>
		:	<ul className="flex flex-col gap">
				{characters.map((character) => (
					<li key={character._id}>
						<CharacterCard character={character} />
					</li>
				))}
			</ul>
}

function RoomBackground({ roomId }: { roomId: Id<"rooms"> }) {
	const scenes = useQuery(
		api.entities.scenes.list,
		roomId ? { roomId } : "skip",
	)
	const characters = useQuery(
		api.entities.characters.list,
		roomId ? { roomId } : "skip",
	)
	const activeScene = scenes?.find((scene) => scene.isActive)

	if (
		activeScene?.sceneryBackgroundUrl &&
		(activeScene.mode === "scenery" || !activeScene.battlemapBackgroundUrl)
	) {
		return (
			<img
				src={activeScene.sceneryBackgroundUrl}
				alt=""
				className="absolute inset-0 size-full object-cover"
				draggable={false}
			/>
		)
	}

	if (
		activeScene?.battlemapBackgroundUrl &&
		(activeScene.mode === "battlemap" || !activeScene.sceneryBackgroundUrl)
	) {
		return (
			<Battlemap
				scene={activeScene}
				characters={characters ?? []}
				backgroundUrl={activeScene.battlemapBackgroundUrl}
			/>
		)
	}

	return null
}
