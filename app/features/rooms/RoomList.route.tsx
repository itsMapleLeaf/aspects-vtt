import { UserButton } from "@clerk/remix"
import { Link, useHref, useLocation, useNavigate } from "@remix-run/react"
import { useMutation, useQuery } from "convex/react"
import { ConvexError } from "convex/values"
import { LucideHome, LucidePlus } from "lucide-react"
import { $path } from "remix-routes"
import { api } from "../../../convex/_generated/api.js"
import { usePendingDelay } from "../../common/react.ts"
import { AppHeader } from "../../ui/AppHeader.tsx"
import { Button } from "../../ui/Button.tsx"
import { Loading } from "../../ui/Loading.tsx"
import { panel } from "../../ui/styles.ts"

export default function RoomListRoute() {
	const rooms = useQuery(api.rooms.functions.list, {})
	const createRoom = useMutation(api.rooms.functions.create)
	const navigate = useNavigate()
	const currentUrl = useHref(useLocation())
	const loading = usePendingDelay(rooms === undefined)
	return (
		<div className="flex h-dvh flex-col gap-4 p-4">
			<AppHeader end={<UserButton afterSignOutUrl={currentUrl} />} />
			{rooms === undefined ? (
				loading && <Loading fill="parent" />
			) : (
				<main>
					<ul className="mb-2 grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-2">
						{rooms.map((room) => (
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
					<Button
						icon={<LucidePlus />}
						text="Create Room"
						onClick={async () => {
							try {
								const result = await createRoom({})
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
			)}
		</div>
	)
}
