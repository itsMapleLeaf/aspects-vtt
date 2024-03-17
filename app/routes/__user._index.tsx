import { getAuth } from "@clerk/remix/ssr.server"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { Link, redirect, useNavigate } from "@remix-run/react"
import { useMutation, useQuery } from "convex/react"
import { LucideHome, LucidePlus } from "lucide-react"
import { $path } from "remix-routes"
import { Button } from "#app/ui/Button.tsx"
import { panel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"

export async function loader(args: LoaderFunctionArgs) {
	const auth = await getAuth(args)
	if (!auth.userId) {
		return redirect($path("/sign-up"))
	}
	return {}
}

export default function CreateRoomRoute() {
	const rooms = useQuery(api.rooms.list)
	const createRoom = useMutation(api.rooms.create)
	const navigate = useNavigate()
	return (
		<main>
			<ul className="mb-2 grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-2">
				{rooms?.map((room) => (
					<li key={room._id}>
						<Link
							to={$path("/rooms/:roomSlug", { roomSlug: room.slug })}
							className={panel(
								"flex h-full items-center gap-3 bg-primary-200/50 p-4 transition hover:bg-primary-200",
							)}
						>
							<LucideHome />
							<h2 className="flex-1 font-light text-lg">{room.name}</h2>
						</Link>
					</li>
				))}
			</ul>
			<Button
				icon={<LucidePlus />}
				text="Create Room"
				onClick={async () => {
					const result = await createRoom()
					if (result.error != null) {
						alert(`Failed to create room: ${result.error}`)
					} else {
						navigate($path("/rooms/:roomSlug", { roomSlug: result.slug }))
					}
				}}
			/>
		</main>
	)
}
