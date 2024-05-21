import { httpRouter } from "convex/server"
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import { httpAction } from "./_generated/server"

const http = httpRouter()

http.route({
	path: "/image",
	method: "GET",
	handler: httpAction(async (ctx, request) => {
		const url = new URL(request.url)
		const storageId = url.searchParams.get("id")
		if (!storageId) {
			return new Response(null, {
				status: 400,
				statusText: `Missing required query parameter "id"`,
			})
		}

		const file = await ctx.storage.get(storageId as Id<"_storage">)
		if (!file) {
			return new Response(null, {
				status: 404,
				statusText: `File with id "${storageId}" not found`,
			})
		}

		const metadata = await ctx.runQuery(
			internal.storage.functions.getMetadata,
			{
				storageId: storageId as Id<"_storage">,
			},
		)

		const headers = new Headers({
			"Cache-Control": "public, max-age=31536000, immutable",
		})
		if (metadata?.contentType) {
			headers.set("Content-Type", metadata.contentType)
		}
		return new Response(file, {
			headers,
		})
	}),
})

export default http
