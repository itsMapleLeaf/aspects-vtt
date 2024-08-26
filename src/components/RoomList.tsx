import { Link, useNavigate } from "@remix-run/react"
import { useMutation, useQuery } from "convex/react"
import {
	LucideGamepad2,
	LucideImageOff,
	LucidePlus,
	LucideWand2,
} from "lucide-react"
import { api } from "../../convex/_generated/api.js"
import { Doc } from "../../convex/_generated/dataModel.js"
import { Button } from "../ui/button.js"
import { EmptyState } from "../ui/empty-state.js"
import { Form, FormActions, FormError, useForm } from "../ui/form.js"
import { InputField, useInput } from "../ui/input.js"
import { Modal, ModalButton, ModalPanel } from "../ui/modal.js"
import { SkeletonGrid } from "../ui/skeleton.js"

export function RoomList() {
	const rooms = useQuery(api.functions.rooms.list)
	return (
		<div className="container mx-auto flex flex-col items-start gap-4">
			{rooms === undefined ? (
				<SkeletonGrid count={6} />
			) : rooms.length === 0 ? (
				<EmptyState title="No rooms found." icon={<LucideGamepad2 />}>
					<CreateRoomButton />
				</EmptyState>
			) : (
				<>
					<div className="grid grid-cols-[repeat(auto-fill,16rem)] gap-4">
						{rooms.map((room) => (
							<RoomCard key={room._id} room={room} />
						))}
					</div>
					<CreateRoomButton />
				</>
			)}
		</div>
	)
}

function RoomCard({ room }: { room: Doc<"rooms"> }) {
	return (
		<Link
			to={`/${room.slug}`}
			className="card image-full card-bordered bg-base-100 shadow-lg transition-transform hover:scale-105"
		>
			<figure className="aspect-video">
				<LucideImageOff className="size-16 opacity-50" />
			</figure>
			<div className="card-body place-self-center">
				<h2 className="card-title text-balance text-center">{room.name}</h2>
			</div>
		</Link>
	)
}
function CreateRoomButton() {
	return (
		<Modal>
			<ModalButton className="btn">
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
		<Form className="grid gap-3" action={form.action}>
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
				label="Slug"
				description={
					form.values.slug &&
					`Your room will be available at ${window.location.origin}/${form.values.slug}`
				}
				placeholder="rosenfeld"
				required
			/>
			<FormActions>
				<Button type="submit" icon={<LucideWand2 />}>
					Create
				</Button>
			</FormActions>
			<FormError>{form.error}</FormError>
		</Form>
	)
}
