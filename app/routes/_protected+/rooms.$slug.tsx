import { Outlet, useParams } from "@remix-run/react"
import { $params } from "remix-routes"
import { RoomProvider } from "#app/features/rooms/roomContext.js"

export default function RoomRoute() {
	const { slug } = $params("/rooms/:slug", useParams())
	return (
		<RoomProvider slug={slug}>
			<Outlet />
		</RoomProvider>
	)
}
