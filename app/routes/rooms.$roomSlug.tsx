import { Outlet, useParams } from "@remix-run/react"
import { useQuery } from "convex/react"
import { $params } from "remix-routes"
import { RoomProvider } from "#app/features/rooms/useRoom.js"
import { Loading } from "#app/ui/Loading.js"
import { api } from "#convex/_generated/api.js"

export default function RoomRoute() {
	const { roomSlug } = $params("/rooms/:roomSlug", useParams())
	const room = useQuery(api.rooms.get, { slug: roomSlug })
	return room === undefined ? (
		<div className="flex h-dvh flex-col items-center justify-center">
			<Loading />
		</div>
	) : room === null ? (
		<p>Room not found.</p>
	) : (
		<RoomProvider room={room}>
			<Outlet />
		</RoomProvider>
	)
}
