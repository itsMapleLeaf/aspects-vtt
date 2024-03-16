import { Link, Outlet, useParams } from "@remix-run/react"
import { useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { $params, $path } from "remix-routes"
import { RoomProvider } from "#app/features/rooms/useRoom.js"
import { Button } from "#app/ui/Button.js"
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
		<main className="flex flex-col gap-4 p-4">
			<p>Room not found.</p>
			<Button text="Return to home" icon={<Lucide.DoorOpen />} element={<Link to={$path("/")} />} />
		</main>
	) : (
		<RoomProvider room={room}>
			<Outlet />
		</RoomProvider>
	)
}
