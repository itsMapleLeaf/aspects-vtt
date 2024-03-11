import { httpRouter } from "convex/server"
import { api } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import { httpAction } from "./_generated/server"

const http = httpRouter()

http.route({
	path: "/image",
	method: "GET",
	handler: httpAction(async (ctx, request) => {
		const url = new URL(request.url)
		const id = url.searchParams.get("id")
		if (!id) {
			return new Response(`Missing required query parameter "id"`, { status: 400 })
		}

		const image = await ctx.runQuery(api.images.get, { id: id as Id<"images"> })
		if (!image) {
			return new Response(`Image with id "${id}" not found`, { status: 404 })
		}

		const file = await ctx.storage.get(image.storageId)
		if (!file) {
			return new Response(
				`File with id "${image.storageId}" not found for image id "${image._id}"`,
				{ status: 404 },
			)
		}

		return new Response(file, {
			headers: {
				"Content-Type": image.mimeType,
			},
		})
	}),
})

export default http
