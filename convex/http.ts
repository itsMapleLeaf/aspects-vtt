import { httpRouter } from "convex/server"
import type { Id } from "./_generated/dataModel.js"
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
				origin?.startsWith("http://127.0.0.1") ||
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

http.route({
	path: "/images",
	method: "GET",
	handler: httpAction(async (ctx, request) => {
		const id = new URL(request.url).searchParams.get("id")
		if (!id) {
			return new Response("Missing ID param", { status: 404 })
		}

		const blob = await ctx.storage.get(id as Id<"_storage">)
		if (!blob) {
			return new Response("Image not found", { status: 404 })
		}

		return new Response(blob, {
			status: 200,
			headers: { "Access-Control-Allow-Origin": "*" },
		})
	}),
})

export default http
