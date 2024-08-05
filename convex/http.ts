import { httpRouter } from "convex/server"
import { Data, Effect } from "effect"
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import { httpAction } from "./api.ts"
import { auth } from "./auth"

const http = httpRouter()

auth.addHttpRoutes(http)

http.route({
	path: "/image",
	method: "GET",
	handler: httpAction((ctx, request) => {
		return Effect.gen(function* () {
			const url = new URL(request.url)
			const storageId = url.searchParams.get("id")
			if (!storageId) {
				return new Response(null, {
					status: 400,
					statusText: `Missing required query parameter "id"`,
				})
			}

			const file = yield* Effect.promise(() =>
				ctx.internal.storage.get(storageId as Id<"_storage">),
			)
			if (!file) {
				return new Response(null, {
					status: 404,
					statusText: `File with id "${storageId}" not found`,
				})
			}

			const metadata = yield* ctx.runQuery(internal.storage.getMetadata, {
				storageId: storageId as Id<"_storage">,
			})

			const headers = new Headers({
				"Cache-Control": "public, max-age=31536000, immutable",
			})
			if (metadata?.contentType) {
				headers.set("Content-Type", metadata.contentType)
			}
			return new Response(file, {
				headers,
			})
		})
	}),
})

export default http
