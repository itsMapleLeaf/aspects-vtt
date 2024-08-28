import { useParams, useSearchParams } from "@remix-run/react"
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
import { Modal, ModalPanel } from "../ui/modal.tsx"
import { SceneList } from "../components/SceneList.tsx"
import { useState } from "react"
import { typed } from "../../lib/types.ts"

export default function RoomRoute() {
	const params = useParams() as { room: string }
	const room = useQuery(api.functions.rooms.getBySlug, { slug: params.room })
	const [searchParams, setSearchParams] = useSearchParams()

	type Panel = {
		id: string
		title: string
		content: React.ReactNode
	}

	const [sidebars, setSidebars] = useState({
		left: { open: true, panels: typed<Panel[]>([]) },
		right: { open: true, panels: typed<Panel[]>([]) },
	})

	function toggleSidebar(which: "left" | "right") {
		setSidebars((current) => ({
			...current,
			[which]: {
				...current[which],
				open: !current[which].open,
			},
		}))
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
							{sidebars.left.open ? (
								<LucideSidebarClose />
							) : (
								<LucideSidebarOpen />
							)}
						</button>
					}
					right={
						<button
							type="button"
							key="close"
							className={clearCircleButton("hidden lg:block")}
							onClick={() => toggleSidebar("right")}
						>
							{sidebars.right.open ? (
								<LucideSidebarClose className="-scale-x-100" />
							) : (
								<LucideSidebarOpen className="-scale-x-100" />
							)}
						</button>
					}
				/>
				<div className="hidden min-h-0 flex-1 gap-3 p-3 pt-0 *:w-80 lg:flex">
					{sidebars.left.open && (
						<div className="flex min-h-0 flex-col gap-3">
							{scenesPanel}
							{scenesPanel}
							{scenesPanel}
						</div>
					)}
					{sidebars.right.open && (
						<div className="ml-auto flex min-h-0 flex-col gap-3">
							{scenesPanel}
							{scenesPanel}
						</div>
					)}
				</div>
				{sidebars.left.open && (
					<div className="flex min-h-0 flex-1 flex-col gap-3 p-3 pt-0 *:w-80 lg:hidden">
						{scenesPanel}
						{scenesPanel}
						{scenesPanel}
						{scenesPanel}
						{scenesPanel}
					</div>
				)}
			</div>

			<Modal open={searchParams.get("view") === "scenes"}>
				<ModalPanel
					title="Scenes"
					onClose={() =>
						setSearchParams((p) => {
							p.delete("view")
							return p
						})
					}
				>
					<div className="w-[calc(100vw-8rem)] max-w-screen-sm">
						<SceneList />
					</div>
				</ModalPanel>
			</Modal>

			{/* <div className="fixed inset-x-auto bottom-0">
				<Modal>
					<ModalButton className="btn btn-square btn-ghost btn-md">
						<LucideImages className="size-8" />
					</ModalButton>
					<ModalPanel title="Scenes" className="flex max-h-full flex-col p-3">
						<div className="-m-3 overflow-y-auto overflow-x-clip p-3">
							<SceneList />
						</div>
					</ModalPanel>
				</Modal>

				<button type="button">
					<LucideUsers2 />
				</button>

				<button type="button">
					<LucideBoxes />
				</button>

				<button type="button">
					<LucideCalendarClock />
				</button>

				<button type="button">
					<LucideSettings />
				</button>
			</div> */}
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
