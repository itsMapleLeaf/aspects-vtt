import { useParams } from "@remix-run/react"
import { useQuery } from "convex/react"
import {
	LucideBoxes,
	LucideCalendarClock,
	LucideImages,
	LucideSettings,
	LucideUsers2,
} from "lucide-react"
import { api } from "../../convex/_generated/api.js"
import { AppHeader } from "../ui/app-header.tsx"
import { mergeClassProp } from "../ui/helpers.ts"
import { Modal, ModalButton, ModalPanel } from "../ui/modal.tsx"
import { Slot, SlotProps } from "../ui/slot.tsx"
import { SceneList } from "../components/SceneList.tsx"

export default function RoomRoute() {
	const params = useParams() as { room: string }
	const room = useQuery(api.functions.rooms.getBySlug, { slug: params.room })
	return (
		<>
			<AppHeader />

			<div className="fixed inset-x-auto bottom-0">
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
