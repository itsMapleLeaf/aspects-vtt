import { ConvexError, v } from "convex/values"
import { generateSlug } from "random-word-slugs"
import { raise } from "#app/common/errors.js"
import { pick } from "#app/common/object.js"
import type { Doc, Id } from "./_generated/dataModel.js"
import { type QueryCtx, mutation, query } from "./_generated/server.js"
import { getIdentityUser } from "./auth.js"
import { withResultResponse } from "./resultResponse.js"
import { replaceFile } from "./storage.js"

export const get = query({
	args: { slug: v.string() },
	handler: withResultResponse(async (ctx, args) => {
		const { room, isOwner } = await createRoomContext(ctx, await getRoomBySlug(ctx, args))

		const players =
			isOwner ?
				await Promise.all(room.players.map((player) => ctx.db.get(player.userId))).then((players) =>
					players.filter(Boolean).map((player) => pick(player, ["_id", "name", "avatarUrl"])),
				)
			:	undefined

		return {
			mapDimensions: { width: 1000, height: 1000 },
			mapCellSize: 50,
			...pick(room, ["_id", "_creationTime", "name", "mapImageId", "mapDimensions", "mapCellSize"]),
			isOwner,
			players,
		}
	}),
})

export const list = query({
	handler: withResultResponse(async (ctx: QueryCtx) => {
		const user = await getIdentityUser(ctx)
		return await ctx.db
			.query("rooms")
			.withIndex("by_owner", (q) => q.eq("ownerId", user._id))
			.collect()
	}),
})

export const create = mutation({
	handler: async (ctx) => {
		const user = await getIdentityUser(ctx)
		const slug = await generateUniqueSlug(ctx)
		await ctx.db.insert("rooms", {
			name: slug,
			slug,
			ownerId: user._id,
			players: [],
		})
		return { slug }
	},
})

export const update = mutation({
	args: {
		id: v.id("rooms"),
		name: v.optional(v.string()),
		mapImageId: v.optional(v.id("_storage")),
		mapDimensions: v.optional(v.object({ width: v.number(), height: v.number() })),
		mapCellSize: v.optional(v.number()),
	},
	handler: async (ctx, { id, ...args }) => {
		const { room } = await getRoomOwnerOnlyContext(ctx, id)

		await ctx.db.patch(id, {
			...args,
			mapImageId: (await replaceFile(ctx, room.mapImageId, args.mapImageId)) ?? undefined,
		})
	},
})

export const remove = mutation({
	args: { id: v.id("rooms") },
	handler: async (ctx, args) => {
		await getRoomOwnerOnlyContext(ctx, args.id)
		return await ctx.db.delete(args.id)
	},
})

export const join = mutation({
	args: {
		id: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		const user = await getIdentityUser(ctx)
		const room = await getRoomById(ctx, args.id)
		if (!room.players.some((player) => player.userId === user._id)) {
			await ctx.db.patch(args.id, {
				players: [...room.players, { userId: user._id }],
			})
		}
	},
})

async function getRoomById(ctx: QueryCtx, roomId: Id<"rooms">) {
	return (await ctx.db.get(roomId)) ?? raise(new ConvexError("Room not found"))
}

async function getRoomBySlug(ctx: QueryCtx, args: { slug: string }) {
	const room = await ctx.db
		.query("rooms")
		.withIndex("by_slug", (q) => q.eq("slug", args.slug))
		.unique()
	return room ?? raise(new ConvexError("Room not found"))
}

async function generateUniqueSlug(ctx: QueryCtx) {
	const isSlugTaken = async (slug: string) => {
		try {
			await getRoomBySlug(ctx, { slug })
			return true
		} catch (error) {
			if (error instanceof ConvexError && error.message === "Room not found") {
				return false
			}
			throw error
		}
	}

	let slug
	let attempts = 0
	do {
		slug = generateSlug()
		attempts++
	} while ((await isSlugTaken(slug)) && attempts < 10)
	return slug ?? raise(new Error("Failed to generate unique slug"))
}

export async function getRoomContext(ctx: QueryCtx, roomId: Id<"rooms">) {
	return await createRoomContext(ctx, await getRoomById(ctx, roomId))
}

async function createRoomContext(ctx: QueryCtx, room: Doc<"rooms">) {
	const user = await getIdentityUser(ctx)
	const isOwner = room.ownerId === user._id
	const player = room.players.find((player) => player.userId === user._id)
	return { room: room, user: user, player, isOwner }
}

export async function getRoomOwnerOnlyContext(ctx: QueryCtx, roomId: Id<"rooms">) {
	const { isOwner, ...context } = await getRoomContext(ctx, roomId)
	if (!isOwner) {
		throw new ConvexError("You don't have permission to access this room.")
	}
	return context
}

export async function getRoomPlayerContext(ctx: QueryCtx, roomId: Id<"rooms">) {
	const { player, ...context } = await getRoomContext(ctx, roomId)
	if (!player) {
		throw new Error("Player object not found")
	}
	return { ...context, player }
}
