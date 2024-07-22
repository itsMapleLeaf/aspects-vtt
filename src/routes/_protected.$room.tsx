import { Link, useParams } from "@remix-run/react"
import { useQuery } from "convex/react"
import {
	LucideBoxes,
	LucideCalendarClock,
	LucideImages,
	LucideSettings,
	LucideUsers2,
} from "lucide-react"
import { api } from "../../convex/_generated/api.js"
import { UserButton } from "../auth/user-button.tsx"
import { SceneList } from "../scenes/scene-list.tsx"
import { AppLogo } from "../ui/app-logo.tsx"
import { Button } from "../ui/button.tsx"
import { Heading } from "../ui/heading.tsx"
import { mergeClassProp } from "../ui/helpers.ts"
import { Column, Row } from "../ui/layout.tsx"
import { Modal } from "../ui/modal.tsx"
import { Panel } from "../ui/panel.js"
import { Slot, SlotProps } from "../ui/slot.tsx"

export default function RoomRoute() {
	const params = useParams() as { room: string }
	const room = useQuery(api.rooms.getBySlug, { slug: params.room })
	return (
		<div className="fixed inset-0">
			<Column className="pointer-events-none fixed inset-0 items-stretch p-3">
				<Row className="items-center justify-between">
					<Button
						element={<Link to="/" />}
						icon={null}
						appearance="clear"
						className="pointer-events-auto h-12"
					>
						<Heading className="text-2xl">
							<AppLogo />
						</Heading>
					</Button>
					<div className="contents *:pointer-events-auto">
						<UserButton />
					</div>
				</Row>
				<Panel className="pointer-events-auto mx-auto mt-auto flex w-full max-w-fit gap-2 p-1">
					<Modal>
						<PanelButton element={<Modal.Button />}>
							<LucideImages />
						</PanelButton>
						<Modal.Panel
							title="Scenes"
							className="flex max-h-full flex-col p-3"
						>
							<div className="-m-3 overflow-y-auto overflow-x-clip p-3">
								<SceneList />
							</div>
						</Modal.Panel>
					</Modal>

					<PanelButton>
						<LucideUsers2 />
					</PanelButton>

					<PanelButton>
						<LucideBoxes />
					</PanelButton>

					<PanelButton>
						<LucideCalendarClock />
					</PanelButton>

					<PanelButton>
						<LucideSettings />
					</PanelButton>
				</Panel>
			</Column>
		</div>
	)
}

function PanelButton(props: SlotProps) {
	return (
		<Slot
			type="button"
			{...mergeClassProp(
				props,
				"aspect-square rounded p-2 opacity-75 transition will-change-transform *:size-8 hover:bg-base-800 hover:opacity-100 active:scale-95 active:bg-base-700 active:duration-0",
			)}
		/>
	)
}
