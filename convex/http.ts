import { httpRouter } from "convex/server"
import { httpAction } from "./_generated/server.js"
import { auth } from "./auth"

const http = httpRouter()

auth.addHttpRoutes(http)

http.route({
	path: "/images",
	method: "PUT",
	handler: httpAction(async (ctx, request) => {
		const blob = await request.blob()
		const storageId = await ctx.storage.store(blob)
		return Response.json({ storageId })
	}),
})

export default http
