import { useParams } from "@remix-run/react"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api.js"

export default function RoomRoute() {
	const params = useParams() as { room: string }
	const room = useQuery(api.rooms.getBySlug, { slug: params.room })
	return <section>welcome to {room?.name}</section>
}
