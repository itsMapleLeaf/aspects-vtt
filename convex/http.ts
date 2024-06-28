import { createClerkClient } from "@clerk/remix/api.server"
import type { WebhookEvent } from "@clerk/remix/ssr.server"
import { httpRouter } from "convex/server"
import { Webhook } from "svix"
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import { httpAction } from "./_generated/server"
import { convexEnv } from "./env.ts"
import type { Branded } from "./helpers/convex.ts"

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

		const metadata = await ctx.runQuery(internal.storage.getMetadata, {
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
	}),
})

http.route({
	path: "/webhooks/clerk",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		const env = convexEnv()

		const webhook = new Webhook(env.CLERK_WEBHOOK_SECRET)
		const event = webhook.verify(
			await request.text(),
			Object.fromEntries(request.headers),
		) as WebhookEvent

		switch (event.type) {
			case "user.created":
			case "user.updated": {
				await ctx.runMutation(internal.users.upsert, {
					name: event.data.username || event.data.id,
					avatarUrl: event.data.image_url,
					clerkId: event.data.id as Branded<"clerkId">,
				})
				break
			}

			case "user.deleted": {
				await ctx.runMutation(internal.users.remove, {
					clerkId: event.data.id as Branded<"clerkId">,
				})
				break
			}

			case "session.created": {
				const clerk = createClerkClient({
					secretKey: env.CLERK_SECRET_KEY,
				})
				const user = await clerk.users.getUser(event.data.user_id)

				await ctx.runMutation(internal.users.upsert, {
					name: user.username || user.id,
					avatarUrl: user.imageUrl,
					clerkId: user.id as Branded<"clerkId">,
				})

				break
			}

			default: {
				console.warn(`Unhandled webhook event type: ${event.type}`, event.data)
				return new Response(null, { status: 400, statusText: "Unhandled webhook event type" })
			}
		}

		return new Response(null, { status: 200 })
	}),
})

export default http
