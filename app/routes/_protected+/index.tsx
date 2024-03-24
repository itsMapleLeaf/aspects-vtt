import { UserButton } from "@clerk/remix"
import { Link, useNavigate } from "@remix-run/react"
import { useMutation, useQuery } from "convex/react"
import { ConvexError } from "convex/values"
import { LucideHome, LucidePlus } from "lucide-react"
import { $path } from "remix-routes"
import { AppHeader } from "#app/ui/AppHeader.js"
import { Button } from "#app/ui/Button.tsx"
import { Loading } from "#app/ui/Loading.js"
import { panel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"

export default function CreateRoomRoute() {
	const rooms = useQuery(api.rooms.list)
	const createRoom = useMutation(api.rooms.create)
	const navigate = useNavigate()
	return (
		<div className="grid gap-4 p-4">
			<AppHeader>
				<UserButton />
			</AppHeader>
			<main>
				{rooms === undefined ?
					<Loading />
				: !rooms.ok ?
					<p>Failed to load rooms: {rooms.error}</p>
				:	<ul className="mb-2 grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-2">
						{rooms.data.map((room) => (
							<li key={room._id}>
								<Link
									to={$path("/rooms/:slug", { slug: room.slug })}
									className={panel(
										"flex h-full items-center gap-3 bg-primary-200/50 p-4 transition hover:bg-primary-200",
									)}
								>
									<LucideHome />
									<h2 className="flex-1 text-lg font-light">{room.name}</h2>
								</Link>
							</li>
						))}
					</ul>
				}
				<Button
					icon={<LucidePlus />}
					text="Create Room"
					onClick={async () => {
						try {
							const result = await createRoom()
							navigate($path("/rooms/:slug", { slug: result.slug }))
						} catch (error) {
							if (error instanceof ConvexError) {
								alert(`Failed to create room: ${error.message}`)
							} else {
								alert("Failed to create room")
							}
						}
					}}
				/>
			</main>
		</div>
	)
}
