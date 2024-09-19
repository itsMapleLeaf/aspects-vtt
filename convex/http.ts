import { httpRouter } from "convex/server"
import { httpAction } from "./_generated/server.js"
import { auth } from "./auth"

const http = httpRouter()

auth.addHttpRoutes(http)

http.route({
	pathPrefix: "/",
	method: "OPTIONS",
	handler: httpAction(async (ctx, request) => {
		const origin = request.headers.get("Origin")

		const isValidOrigin =
			origin &&
			(origin?.startsWith("http://localhost") ||
				origin?.endsWith("mapleleaf.dev"))

		if (!isValidOrigin) {
			return new Response(null, { status: 400 })
		}

		const headers = new Headers([
			["Access-Control-Allow-Origin", origin],
			["Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"],
			["Access-Control-Allow-Headers", "Content-Type"],
		])
		return new Response(null, { status: 204, headers })
	}),
})

http.route({
	path: "/images",
	method: "PUT",
	handler: httpAction(async (ctx, request) => {
		const blob = await request.blob()
		const storageId = await ctx.storage.store(blob)
		return Response.json(
			{ storageId },
			{ status: 201, headers: { "Access-Control-Allow-Origin": "*" } },
		)
	}),
})

export default http
