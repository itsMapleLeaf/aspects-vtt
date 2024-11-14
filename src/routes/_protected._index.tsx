import { Link } from "@remix-run/react"
import { useQuery } from "convex/react"
import { api } from "~/convex/_generated/api.js"

export default function IndexRoute() {
	const rooms = useQuery(api.rooms.list)
	return (
		<ul>
			{rooms?.map((room) => (
				<li key={room._id}>
					<Link to={`/rooms/${room.slug}`}>{room.name}</Link>
				</li>
			))}
		</ul>
	)
}
