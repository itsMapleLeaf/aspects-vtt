import { Link, useNavigate } from "@remix-run/react"
import { useMutation, useQuery } from "convex/react"
import { LucideHome, LucidePlus } from "lucide-react"
import { $path } from "remix-routes"
import { useSafeAction } from "~/modules/convex/hooks.ts"
import { AppHeader } from "~/ui/AppHeader.tsx"
import { Button } from "~/ui/Button.tsx"
import { Loading } from "~/ui/Loading.tsx"
import { panel } from "~/ui/styles.ts"
import { usePendingDelay } from "../../common/react/hooks.js"
import { api } from "../../convex/_generated/api.js"

export default function RoomListRoute() {
	const rooms = useQuery(api.rooms.functions.list, {})
	const createRoom = useMutation(api.rooms.functions.create)
	const navigate = useNavigate()
	const loading = usePendingDelay(rooms === undefined)

	const [, submit] = useSafeAction(async () => {
		const result = await createRoom({})
		navigate($path("/rooms/:slug", { slug: result.slug }))
	})

	return (
		<div className="flex h-dvh flex-col p-4 gap-4">
			<AppHeader />
			{rooms === undefined ?
				loading && <Loading fill="parent" />
			:	<main>
					<ul className="mb-2 grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-2">
						{rooms.map((room) => (
							<li key={room._id}>
								<Link
									to={$path("/rooms/:slug", { slug: room.slug })}
									className={panel(
										"flex h-full items-center bg-primary-800/50 p-4 transition gap-3 hover:bg-primary-800",
									)}
									prefetch="intent"
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
						onClick={() => submit()}
					/>
				</main>
			}
		</div>
	)
}
