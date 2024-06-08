import { UserButton } from "@clerk/remix"
import { Link, useHref, useLocation, useNavigate } from "@remix-run/react"
import { useMutation, useQuery } from "convex/react"
import { LucideHome, LucidePlus } from "lucide-react"
import { $path } from "remix-routes"
import { api } from "../../convex/_generated/api.js"
import { useSafeAction } from "../common/convex.ts"
import { usePendingDelay } from "../common/react.ts"
import { AppHeader } from "../ui/AppHeader.tsx"
import { Button } from "../ui/Button.tsx"
import { Loading } from "../ui/Loading.tsx"
import { panel } from "../ui/styles.ts"
import { ProtectedLayout } from "./_protected/ProtectedLayout.tsx"

// rendering the protected layout here is a workaround;
// there's a bug in the vercel preset that prevents index routes in layout routes from working
export default function RoomListRoute() {
	return (
		<ProtectedLayout>
			<Content />
		</ProtectedLayout>
	)
}

function Content() {
	const rooms = useQuery(api.rooms.functions.list, {})
	const createRoom = useMutation(api.rooms.functions.create)
	const navigate = useNavigate()
	const currentUrl = useHref(useLocation())
	const loading = usePendingDelay(rooms === undefined)

	const [, submit] = useSafeAction(async () => {
		const result = await createRoom({})
		navigate($path("/rooms/:slug", { slug: result.slug }))
	})

	return (
		<div className="flex h-dvh flex-col gap-4 p-4">
			<AppHeader end={<UserButton afterSignOutUrl={currentUrl} />} />
			{rooms === undefined ?
				loading && <Loading fill="parent" />
			:	<main>
					<ul className="mb-2 grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-2">
						{rooms.map((room) => (
							<li key={room._id}>
								<Link
									to={$path("/rooms/:slug", { slug: room.slug })}
									className={panel(
										"flex h-full items-center gap-3 bg-primary-200/50 p-4 transition hover:bg-primary-200",
									)}
									prefetch="intent"
								>
									<LucideHome />
									<h2 className="flex-1 text-lg font-light">{room.name}</h2>
								</Link>
							</li>
						))}
					</ul>
					<Button icon={<LucidePlus />} text="Create Room" onClick={() => submit()} />
				</main>
			}
		</div>
	)
}
