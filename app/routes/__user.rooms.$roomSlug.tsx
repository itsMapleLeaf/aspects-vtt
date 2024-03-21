import { Link, Outlet, useParams } from "@remix-run/react"
import { useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { $params, $path } from "remix-routes"
import { RoomProvider } from "#app/features/rooms/roomContext.js"
import { Button } from "#app/ui/Button.js"
import { Loading } from "#app/ui/Loading.js"
import { api } from "#convex/_generated/api.js"

export default function RoomRoute() {
	const { roomSlug } = $params("/rooms/:roomSlug", useParams())
	const room = useQuery(api.rooms.get, { slug: roomSlug })
	return (
		room === undefined ?
			<div className="flex h-full flex-col items-center justify-center">
				<Loading />
			</div>
		: !room.ok ?
			<main className="flex flex-col gap-4">
				<p>{room.error}</p>
				<Button
					text="Return to home"
					icon={<Lucide.DoorOpen />}
					element={<Link to={$path("/")} />}
					className="self-start"
				/>
			</main>
		:	<RoomProvider room={room.data}>
				<Outlet />
			</RoomProvider>
	)
}
