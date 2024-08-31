import { httpRouter } from "convex/server"
import { Effect } from "effect"
import { auth } from "./auth"
import { httpAction } from "./lib/api.ts"

const http = httpRouter()

auth.addHttpRoutes(http)

http.route({
	pathPrefix: "/",
	method: "OPTIONS",
	handler: httpAction((ctx, request) => {
		const origin = request.headers.get("Origin")
		if (
			origin?.startsWith("http://localhost") ||
			origin?.endsWith("mapleleaf.dev")
		) {
			const headers = new Headers([
				["Access-Control-Allow-Origin", origin],
				["Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"],
				["Access-Control-Allow-Headers", "Content-Type"],
			])
			return Effect.succeed(new Response(null, { status: 204, headers }))
		}

		return Effect.succeed(new Response(null, { status: 400 }))
	}),
})

http.route({
	path: "/images",
	method: "PUT",
	handler: httpAction((ctx, request) =>
		Effect.gen(function* () {
			const blob = yield* Effect.promise(() => request.blob())
			const storageId = yield* Effect.promise(() =>
				ctx.internal.storage.store(blob),
			)
			return Response.json(
				{ storageId },
				{ status: 201, headers: { "Access-Control-Allow-Origin": "*" } },
			)
		}),
	),
})

export default http
