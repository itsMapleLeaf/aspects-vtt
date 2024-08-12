import { httpRouter } from "convex/server"
import { Effect } from "effect"
import { auth } from "./auth"
import { httpAction } from "./lib/api.ts"

const http = httpRouter()

auth.addHttpRoutes(http)

http.route({
	path: "/images",
	method: "PUT",
	handler: httpAction((ctx, request) =>
		Effect.gen(function* () {
			const blob = yield* Effect.promise(() => request.blob())
			const storageId = yield* Effect.promise(() =>
				ctx.internal.storage.store(blob),
			)
			return Response.json({ storageId })
		}),
	),
})

export default http
