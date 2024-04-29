import { Outlet, useParams } from "@remix-run/react"
import { $params } from "remix-routes"
import { RoomProvider } from "#app/features/rooms/roomContext.js"
import { SceneProvider } from "#app/features/scenes/SceneContext.js"

export default function RoomRoute() {
	const { slug } = $params("/rooms/:slug", useParams())
	return (
		<RoomProvider slug={slug}>
			<SceneProvider>
				<Outlet />
			</SceneProvider>
		</RoomProvider>
	)
}
