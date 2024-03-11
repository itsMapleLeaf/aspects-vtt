import { httpRouter } from "convex/server"
import { api } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import { httpAction } from "./_generated/server"

const http = httpRouter()

http.route({
	path: "/characters/image",
	method: "GET",
	handler: httpAction(async (ctx, request) => {
		const url = new URL(request.url)
		const characterId = url.searchParams.get("characterId")
		if (!characterId) {
			return new Response(`Missing required query parameter "characterId"`, { status: 400 })
		}

		const character = await ctx.runQuery(api.characters.get, { id: characterId as string })
		if (!character) {
			return new Response(`Character with id "${characterId}" not found`, { status: 404 })
		}

		if (!character.image) {
			return new Response(`Character with id "${characterId}" has no image`, { status: 404 })
		}

		const file = await ctx.storage.get(character.image.storageId)
		if (!file) {
			return new Response(`File with id "${character.image.storageId}" not found`, { status: 404 })
		}

		return new Response(file, {
			headers: {
				"Content-Type": character.image.mimeType,
			},
		})
	}),
})

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

		return new Response(file)
	}),
})

export default http
