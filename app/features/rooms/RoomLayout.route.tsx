import { Outlet, useParams } from "@remix-run/react"
import { $params } from "remix-routes"
import { RoomProvider } from "./roomContext.tsx"

export default function RoomLayout() {
	const { slug } = $params("/rooms/:slug", useParams())
	return (
		<RoomProvider slug={slug}>
			<Outlet />
		</RoomProvider>
	)
}
