import * as Ariakit from "@ariakit/react"
import { useParams } from "@remix-run/react"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api.js"
import { AppHeader } from "../ui/app-header.tsx"
import {
	LucideImages,
	LucideMessageSquareText,
	LucideSidebarClose,
	LucideSidebarOpen,
	LucideUsers2,
} from "lucide-react"
import {
	clearButton,
	clearCircleButton,
	clearPanel,
	heading2xl,
} from "../ui/styles.ts"
import { SceneList } from "../components/SceneList.tsx"
import { useState } from "react"
import { mapValues } from "../../lib/object.ts"

type PanelId = "characters" | "scenes" | "chat"

export default function RoomRoute() {
	const params = useParams() as { room: string }
	const room = useQuery(api.functions.rooms.getBySlug, { slug: params.room })

	type PanelState = {
		sidebar: Sidebar
		group: number
	}

	const [panels, setPanels] = useState<Record<PanelId, PanelState>>({
		characters: {
			sidebar: "left",
			group: 0,
		},
		scenes: {
			sidebar: "left",
			group: 0,
		},
		chat: {
			sidebar: "right",
			group: 0,
		},
	})

	type Sidebar = "left" | "right"

	const [openSidebars, setOpenSidebars] = useState({
		left: true,
		right: true,
	})

	const leftSidebarOpen = openSidebars.left
	const rightSidebarOpen = openSidebars.right

	function toggleSidebar(which: "left" | "right") {
		setOpenSidebars((current) => ({ ...current, [which]: !current[which] }))
	}

	const panelGroups: Record<Sidebar, Record<number, PanelId[]>> = {
		left: {},
		right: {},
	}

	for (const panelId of Object.keys(panels) as PanelId[]) {
		const panel = panels[panelId]
		const group = (panelGroups[panel.sidebar][panel.group] ??= [])
		group.push(panelId)
	}

	const panelElements = mapValues(panelGroups, (groups) =>
		Object.entries(groups)
			.sort(([a], [b]) => Number(a) - Number(b))
			.map(([group, panelIds]) => (
				<PanelGroup key={group} panelIds={panelIds} />
			)),
	)

	return (
		<>
			<div className="absolute inset-0 flex flex-col">
				<AppHeader
					left={
						<button
							type="button"
							key="close"
							className={clearCircleButton()}
							onClick={() => toggleSidebar("left")}
						>
							{leftSidebarOpen ? <LucideSidebarClose /> : <LucideSidebarOpen />}
						</button>
					}
					right={
						<button
							type="button"
							key="close"
							className={clearCircleButton("hidden lg:block")}
							onClick={() => toggleSidebar("right")}
						>
							{rightSidebarOpen ? (
								<LucideSidebarClose className="-scale-x-100" />
							) : (
								<LucideSidebarOpen className="-scale-x-100" />
							)}
						</button>
					}
				/>
				<div className="hidden min-h-0 flex-1 gap-3 p-3 pt-0 *:w-80 lg:flex">
					{leftSidebarOpen && (
						<div className="flex min-h-0 flex-col gap-3">
							{panelElements.left}
						</div>
					)}
					{rightSidebarOpen && (
						<div className="ml-auto flex min-h-0 flex-col gap-3">
							{panelElements.right}
						</div>
					)}
				</div>
				{leftSidebarOpen && (
					<div className="flex min-h-0 flex-1 flex-col gap-3 p-3 pt-0 *:w-80 lg:hidden">
						{panelElements.left}
						{panelElements.right}
					</div>
				)}
			</div>
		</>
	)
}

function getPanelDetails(id: PanelId) {
	switch (id) {
		case "characters": {
			return {
				id,
				title: "Characters",
				icon: <LucideUsers2 />,
				content: <p>Characters</p>,
			}
		}
		case "scenes": {
			return {
				id,
				title: "Scenes",
				icon: <LucideImages />,
				content: <SceneList />,
			}
		}
		case "chat": {
			return {
				id,
				title: "Chat",
				icon: <LucideMessageSquareText />,
				content: <p className="h-[200vh]">Chat</p>,
			}
		}
	}
}

function PanelGroup({ panelIds }: { panelIds: PanelId[] }) {
	const panels = panelIds.map((panelId) => getPanelDetails(panelId))
	return panels.length === 1 && panels[0] ? (
		<div className={clearPanel("flex min-h-0 flex-1 flex-col")}>
			<h2 className="p-2 opacity-50">
				<PanelLabel icon={panels[0].icon} title={panels[0].title} />
			</h2>
			<div className="min-h-0 flex-1 overflow-y-auto p-3 pt-0">
				{panels[0].content}
			</div>
		</div>
	) : (
		<div className={clearPanel("flex min-h-0 flex-1 flex-col")}>
			<Ariakit.TabProvider>
				<Ariakit.TabList className="flex flex-wrap items-center justify-center gap-1 p-2">
					{panels.map((panel) => (
						<Ariakit.Tab
							key={panel.id}
							id={panel.id}
							className={clearButton(
								"opacity-50 data-[active-item]:bg-primary-600 data-[active-item]:opacity-100",
							)}
						>
							<PanelLabel icon={panel.icon} title={panel.title} />
						</Ariakit.Tab>
					))}
				</Ariakit.TabList>
				{panels.map((panel) => (
					<Ariakit.TabPanel
						key={panel.id}
						id={panel.id}
						className="min-h-0 flex-1 overflow-y-auto rounded p-3 pt-0"
					>
						{panel.content}
					</Ariakit.TabPanel>
				))}
			</Ariakit.TabProvider>
		</div>
	)
}

function PanelLabel({
	icon,
	title,
}: {
	icon: React.ReactNode
	title: React.ReactNode
}) {
	return (
		<span
			className={heading2xl(
				"flex cursor-default select-none flex-row items-center justify-center gap-1.5 text-lg/tight font-medium text-primary-100",
			)}
		>
			{icon}
			{title}
		</span>
	)
}
