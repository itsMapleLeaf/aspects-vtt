import { Outlet, useParams } from "@remix-run/react"
import { $params } from "remix-routes"
import { RoomProvider } from "../../features/rooms/roomContext.tsx"
import { SceneProvider } from "../../features/scenes/SceneContext.tsx"

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
