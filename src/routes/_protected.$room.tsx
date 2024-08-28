import { useParams } from "@remix-run/react"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api.js"
import { AppHeader } from "../ui/app-header.tsx"
import { mergeClassProp } from "../ui/helpers.ts"
import { Slot, SlotProps } from "../ui/slot.tsx"
import {
	LucideImages,
	LucideSidebarClose,
	LucideSidebarOpen,
} from "lucide-react"
import { clearCircleButton, clearPanel, heading2xl } from "../ui/styles.ts"
import { SceneList } from "../components/SceneList.tsx"
import { useState } from "react"

export default function RoomRoute() {
	const params = useParams() as { room: string }
	const room = useQuery(api.functions.rooms.getBySlug, { slug: params.room })

	type Panel = {
		id: string
		title: string
		content: React.ReactNode
	}

	const [openSidebars, setOpenSidebars] = useState({
		left: true,
		right: true,
	})

	const leftSidebarOpen = openSidebars.left
	const rightSidebarOpen = openSidebars.right

	function toggleSidebar(which: "left" | "right") {
		setOpenSidebars((current) => ({ ...current, [which]: !current[which] }))
	}

	const scenesPanel = (
		<div
			className={clearPanel(
				"flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3",
			)}
		>
			<h2
				className={heading2xl(
					"flex cursor-default flex-row items-center justify-center gap-1.5 text-lg/tight font-medium text-primary-100 opacity-50",
				)}
			>
				<LucideImages />
				Scenes
			</h2>
			<SceneList />
		</div>
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
							{scenesPanel}
							{scenesPanel}
							{scenesPanel}
						</div>
					)}
					{rightSidebarOpen && (
						<div className="ml-auto flex min-h-0 flex-col gap-3">
							{scenesPanel}
							{scenesPanel}
						</div>
					)}
				</div>
				{leftSidebarOpen && (
					<div className="flex min-h-0 flex-1 flex-col gap-3 p-3 pt-0 *:w-80 lg:hidden">
						{scenesPanel}
						{scenesPanel}
						{scenesPanel}
						{scenesPanel}
						{scenesPanel}
					</div>
				)}
			</div>
		</>
	)
}

function PanelButton(props: SlotProps) {
	return (
		<Slot
			type="button"
			{...mergeClassProp(
				props,
				"hover:bg-base-800 active:bg-base-700 aspect-square rounded p-2 opacity-75 transition will-change-transform *:size-8 hover:opacity-100 active:scale-95 active:duration-0",
			)}
		/>
	)
}
