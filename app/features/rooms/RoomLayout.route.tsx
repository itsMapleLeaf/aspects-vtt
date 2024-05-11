import { type LoaderFunctionArgs, defer } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import { useParams } from "@remix-run/react"
import { useQuery } from "convex/react"
import { Effect } from "effect"
import { LucideHelpCircle } from "lucide-react"
import { use } from "react"
import { $params } from "remix-routes"
import { api } from "../../../convex/_generated/api.js"
import { getConvexClient } from "../../convex.server.ts"
import { dataFunctionParam, loaderFromEffect } from "../../effect.ts"
import { AuthenticatedAppHeaderLayout } from "../../ui/AppHeaderLayout.tsx"
import { EmptyStatePanel } from "../../ui/EmptyState.tsx"
import { RoomProvider } from "./roomContext.tsx"

const getRoom = loaderFromEffect(
	Effect.gen(function* () {
		const convex = yield* getConvexClient()
		const slug = yield* dataFunctionParam("slug")
		const room = yield* Effect.tryPromise(() => convex.query(api.rooms.functions.get, { slug }))
		if (room) {
			yield* Effect.tryPromise(() => convex.mutation(api.rooms.functions.join, { id: room._id }))
		}
		return room
	}),
)

export const loader = (args: LoaderFunctionArgs) =>
	defer({
		room: getRoom(args),
	})

export default function RoomLayout() {
	const data = useLoaderData<typeof loader>()
	const { slug } = $params("/rooms/:slug", useParams())
	const room = useQuery(api.rooms.functions.get, { slug }) ?? use(data.room)
	return room ? (
		<RoomProvider room={room}>
			<Outlet />
		</RoomProvider>
	) : (
		<AuthenticatedAppHeaderLayout>
			<EmptyStatePanel icon={<LucideHelpCircle />} message="That room does not exist." />
		</AuthenticatedAppHeaderLayout>
	)
}
