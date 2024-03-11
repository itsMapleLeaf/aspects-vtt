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
		const storageId = url.searchParams.get("storageId")
		if (!storageId) {
			return new Response(`Missing required query parameter "storageId"`, { status: 400 })
		}

		const file = await ctx.storage.get(storageId as Id<"_storage">)
		if (!file) {
			return new Response(`File with id "${storageId}" not found`, { status: 404 })
		}

		const image = await ctx.runQuery(internal.images.getByStorageId, {
			storageId: storageId as Id<"_storage">,
		})

		const headers = new Headers()
		if (image?.mimeType) {
			headers.set("Content-Type", image.mimeType)
		}

		return new Response(file, {
			headers,
		})
	}),
})

export default http
