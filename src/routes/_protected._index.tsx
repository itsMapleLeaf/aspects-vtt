import { useQuery } from "convex/react"
import { api } from "~/convex/_generated/api.js"

export function IndexRoute() {
	const rooms = useQuery(api.entities.rooms.list)
	return null
}
