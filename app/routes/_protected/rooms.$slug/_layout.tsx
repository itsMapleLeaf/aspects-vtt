import { type LoaderFunctionArgs, defer } from "@remix-run/node"
import { Outlet } from "@remix-run/react"
import { Effect } from "effect"
import { Suspense } from "react"
import { Loading } from "~/ui/Loading.tsx"
import { api } from "../../../../convex/_generated/api.js"
import { dataFunctionParam, loaderFromEffect } from "../../../helpers/remix.ts"
import { getConvexClient } from "../../../modules/convex/helpers.server.ts"

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
	return (
		<Suspense fallback={<Loading fill="screen" />}>
			<Outlet />
		</Suspense>
	)
}
