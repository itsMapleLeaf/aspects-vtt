import { ConvexError, v } from "convex/values"
import type { Doc, Id } from "../_generated/dataModel"
import { ensureUser, InaccessibleError } from "../lib/auth.ts"
import { mutation, query } from "../lib/ents.ts"
import { nullish } from "../lib/validators.ts"

export const list = query({
	async handler(ctx) {
		return ensureUser(ctx)({
			onAuthorized(userId) {
				return ctx.table("rooms", "ownerId", (q) => q.eq("ownerId", userId))
			},
			onUnauthorized: () => [],
		})
	},
})

export const get = query({
	args: {
		id: v.string(),
	},
	async handler(ctx, args) {
		return ensureUser(ctx)({
			onAuthorized: async () => {
				const id = ctx.table("rooms").normalizeId(args.id)

				const room =
					id ?
						await ctx.table("rooms").get(id)
					:	await ctx.table("rooms").get("slug", args.id)

				return room?.doc()
			},
		})
	},
})

export const create = mutation({
	args: {
		name: v.string(),
		slug: v.string(),
	},
	async handler(ctx, args) {
		return ensureUser(ctx)({
			onAuthorized: async (userId) => {
				const existing = await ctx.table("rooms").get("slug", args.slug)
				if (existing) {
					throw new ConvexError(`The slug "${args.slug}" is already taken`)
				}
				await ctx.table("rooms").insert({ ...args, ownerId: userId })
			},
		})
	},
})

export const update = mutation({
	args: {
		id: v.id("rooms"),
		activeSceneId: nullish(v.id("scenes")),
	},
	handler: protectedMutationHandler(async (ctx, userId, { id, ...args }) => {
		const room = await ctx.table("rooms").get(id)
		if (room == null || !isRoomOwner(room, userId)) {
			throw new ConvexError(`You don't have permission to update this room`)
		}

		await room.patch(args)
	}),
})

export const remove = mutation({
	args: {
		id: v.id("rooms"),
	},
	handler: protectedMutationHandler(async (ctx, userId, { id }) => {
		const room = await ctx.table("rooms").get(id)
		if (!room || !isRoomOwner(room, userId)) {
			throw new InaccessibleError({ id, collection: "rooms" })
		}

		await room.delete()
	}),
})

export function isRoomOwner(room: Doc<"rooms">, userId: Id<"users">) {
	return room.ownerId === userId
}
