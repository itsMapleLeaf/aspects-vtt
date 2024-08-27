import { useNavigate } from "@remix-run/react"
import { useMutation, useQuery } from "convex/react"
import {
	LucideGamepad2,
	LucidePlus,
	LucideTentTree,
	LucideWand2,
} from "lucide-react"
import { api } from "../../convex/_generated/api.js"
import { Doc } from "../../convex/_generated/dataModel.js"
import { EmptyState } from "../ui/empty-state.js"
import { FormActions, FormError, useForm } from "../ui/form.js"
import { InputField, useInput } from "../ui/input.js"
import { Modal, ModalButton, ModalPanel } from "../ui/modal.js"
import { SkeletonGrid } from "../ui/skeleton.js"
import { container, formLayout, heading2xl, solidButton } from "../ui/styles.js"
import { Card } from "../ui/Card.js"

export function RoomList() {
	const rooms = useQuery(api.functions.rooms.list)
	return (
		<div className={container("flex flex-col gap-4")}>
			<div className="flex items-start justify-between">
				<h2 className="text-3xl font-light">Your rooms</h2>
				<CreateRoomButton />
			</div>
			{rooms === undefined ? (
				<SkeletonGrid
					count={6}
					className="grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4"
				/>
			) : rooms.length === 0 ? (
				<EmptyState
					title="No rooms found."
					icon={<LucideGamepad2 />}
				></EmptyState>
			) : (
				<div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
					{rooms.map((room) => (
						<RoomCard key={room._id} room={room} />
					))}
				</div>
			)}
		</div>
	)
}

function RoomCard({ room }: { room: Doc<"rooms"> }) {
	return (
		<Card
			fallbackIcon={<LucideTentTree />}
			caption={room.name}
			to={`/${room.slug}`}
		/>
	)
}

function CreateRoomButton() {
	return (
		<Modal>
			<ModalButton className={solidButton()}>
				<LucidePlus /> Create room
			</ModalButton>
			<ModalPanel
				title="Create room"
				className="grid w-full max-w-sm gap-3 p-3"
			>
				<CreateRoomForm />
			</ModalPanel>
		</Modal>
	)
}

function CreateRoomForm() {
	const createRoom = useMutation(api.functions.rooms.create)
	const navigate = useNavigate()

	const form = useForm({
		inputs: {
			name: useInput(""),
			slug: useInput(""),
		},
		async action(values) {
			await createRoom(form.values)
			navigate(`/${values.slug}`)
		},
	})

	return (
		<form className={formLayout()} action={form.action}>
			<h2 className={heading2xl()}>Create room</h2>
			<InputField
				{...form.inputs.name.props()}
				type="text"
				name="name"
				label="Name"
				description="What do you want to call this room?"
				placeholder="Rosenfeld"
				required
			/>
			<InputField
				{...form.inputs.slug.props()}
				type="text"
				name="slug"
				label="URL Slug"
				description={
					form.values.slug &&
					`Your room will be available at ${window.location.origin}/${form.values.slug}`
				}
				placeholder="rosenfeld"
				required
			/>
			<FormActions>
				<button type="submit" className={solidButton()}>
					<LucideWand2 /> Create
				</button>
			</FormActions>
			<FormError>{form.error}</FormError>
		</form>
	)
}
