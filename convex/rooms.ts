import { ConvexError, v } from "convex/values"
import { generateSlug } from "random-word-slugs"
import { pick } from "#app/common/object.js"
import type { Id } from "./_generated/dataModel.js"
import { type QueryCtx, mutation, query } from "./_generated/server.js"
import { getIdentityUser, requireIdentityUser } from "./auth.js"
import { replaceFile } from "./storage.js"

export const get = query({
	args: { slug: v.string() },
	handler: async (ctx, args) => {
		const user = await getIdentityUser(ctx)
		if (!user) return null

		const room = await getRoomBySlug(ctx, args)
		if (!room) return null

		return {
			...pick(room, ["_id", "_creationTime", "name", "slug", "mapImageId"]),
			isOwner: room.ownerId === user._id,
		}
	},
})

export const list = query({
	async handler(ctx) {
		const user = await getIdentityUser(ctx)
		if (!user) return []

		return await ctx.db
			.query("rooms")
			.withIndex("by_owner", (q) => q.eq("ownerId", user._id))
			.collect()
	},
})

export const create = mutation({
	handler: async (ctx) => {
		const user = await requireIdentityUser(ctx)
		const slug = await generateUniqueSlug(ctx)
		if (!slug) {
			console.error("Failed to create unique slug")
			return { error: "Something went wrong, try again." }
		}

		await ctx.db.insert("rooms", {
			name: slug,
			slug,
			ownerId: user._id,
		})

		return { slug }
	},
})

export const update = mutation({
	args: {
		id: v.id("rooms"),
		name: v.optional(v.string()),
		mapImageId: v.optional(v.id("_storage")),
	},
	handler: async (ctx, { id, ...args }) => {
		const room = await requireOwnedRoom(ctx, id)
		await replaceFile(ctx, room.mapImageId, args.mapImageId)
		return await ctx.db.patch(id, args)
	},
})

export const remove = mutation({
	args: { id: v.id("rooms") },
	handler: async (ctx, args) => {
		return await ctx.db.delete(args.id)
	},
})

async function getRoomBySlug(ctx: QueryCtx, args: { slug: string }) {
	return await ctx.db
		.query("rooms")
		.withIndex("by_slug", (q) => q.eq("slug", args.slug))
		.unique()
}

async function generateUniqueSlug(ctx: QueryCtx): Promise<string | undefined> {
	let slug
	let attempts = 0
	do {
		slug = generateSlug()
		attempts++
	} while ((await getRoomBySlug(ctx, { slug })) == null && attempts < 10)
	return slug
}

export async function requireRoom(ctx: QueryCtx, roomId: Id<"rooms">) {
	const room = await ctx.db.get(roomId)
	if (!room) {
		throw new ConvexError(`Room not found: ${roomId}`)
	}
	return room
}

export async function requireOwnedRoom(ctx: QueryCtx, roomId: Id<"rooms">) {
	const user = await requireIdentityUser(ctx)
	const room = await requireRoom(ctx, roomId)
	if (room.ownerId !== user._id) {
		throw new ConvexError("Room not owned by user.")
	}
	return room
}
