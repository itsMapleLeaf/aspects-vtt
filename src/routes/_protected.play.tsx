import { Link, useNavigate } from "@remix-run/react"
import { useMutation, useQuery } from "convex/react"
import {
	LucideDoorOpen,
	LucideGamepad2,
	LucidePlus,
	LucideWand2,
} from "lucide-react"
import { api } from "../../convex/_generated/api.js"
import { Doc } from "../../convex/_generated/dataModel.js"
import { Button } from "../ui/button.js"
import { EmptyState } from "../ui/empty-state.js"
import { Form, FormActions, FormError, useForm } from "../ui/form.js"
import { HeaderLayout } from "../ui/header-layout.tsx"
import { Heading } from "../ui/heading.js"
import { InputField, useInput } from "../ui/input.js"
import { Modal } from "../ui/modal.js"
import { Panel } from "../ui/panel.js"
import { SkeletonGrid } from "../ui/skeleton.js"

export default function PlayRoute() {
	return (
		<HeaderLayout>
			<RoomList />
		</HeaderLayout>
	)
}

function RoomList() {
	const rooms = useQuery(api.rooms.list)
	return (
		<div className="mx-auto grid w-full max-w-screen-sm grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
			{rooms === undefined ? (
				<SkeletonGrid count={6} />
			) : rooms.length === 0 ? (
				<EmptyState title="No rooms found." icon={<LucideGamepad2 />}>
					<CreateRoomButton />
				</EmptyState>
			) : (
				rooms.map((room) => <RoomCard key={room._id} room={room} />)
			)}
		</div>
	)
}

function RoomCard({ room }: { room: Doc<"rooms"> }) {
	return (
		<Panel
			element={<Link to={`/${room.slug}`} />}
			className="flex aspect-video items-center justify-center gap-2 p-3 transition hover:scale-105"
		>
			<LucideDoorOpen />
			<Heading>{room.name}</Heading>
		</Panel>
	)
}

function CreateRoomButton() {
	return (
		<Modal>
			<Button icon={<LucidePlus />} element={<Modal.Button />}>
				Create room
			</Button>
			<Modal.Panel
				title="Create room"
				className="grid w-full max-w-sm gap-3 p-3"
			>
				<CreateRoomForm />
			</Modal.Panel>
		</Modal>
	)
}

function CreateRoomForm() {
	const createRoom = useMutation(api.rooms.create)
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
