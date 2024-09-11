import { v } from "convex/values"
import type { Id } from "../_generated/dataModel"
import { getAuthUserId } from "../lib/auth.ts"
import {
	EntMutationCtx,
	EntQueryCtx,
	mutation,
	query,
	type Ent,
} from "../lib/ents.ts"
import { nullish } from "../lib/validators.ts"
import { normalizeScene } from "./scenes.ts"

export const list = query({
	handler: async (ctx: EntQueryCtx) => {
		try {
			// const userId = await getAuthUserId(ctx)
			// return await ctx.table("rooms", "ownerId", (q) => q.eq("ownerId", userId))
			return await ctx.table("rooms")
		} catch (error) {
			console.warn(error)
			return []
		}
	},
})

export const get = query({
	args: {
		id: v.id("rooms"),
	},
	handler: async (ctx: EntQueryCtx, args) => {
		const room = await ctx.table("rooms").get(args.id)
		return room ? normalizeRoom(ctx, room) : null
	},
})

export const getBySlug = query({
	args: {
		slug: v.string(),
	},
	handler: async (ctx: EntQueryCtx, { slug }) => {
		try {
			const room = await ctx.table("rooms").getX("slug", slug)
			return await normalizeRoom(ctx, room)
		} catch {
			return null
		}
	},
})

export const getActiveScene = query({
	args: {
		id: v.id("rooms"),
	},
	handler: async (ctx: EntQueryCtx, args) => {
		const room = await ctx.table("rooms").get(args.id)
		if (!room || !room.activeSceneId) {
			return null
		}
		const scene = await ctx.table("scenes").get(room.activeSceneId)
		return scene ? normalizeScene(ctx, scene) : null
	},
})

export const create = mutation({
	args: {
		name: v.string(),
		slug: v.string(),
	},
	handler: async (ctx: EntMutationCtx, args) => {
		const room = await ctx
			.table("rooms", "slug", (q) => q.eq("slug", args.slug))
			.first()
		if (room) {
			throw new Error(`The slug "${args.slug}" is already taken`)
		}
		const userId = await getAuthUserId(ctx)
		await ctx.table("rooms").insert({ ...args, ownerId: userId })
	},
})

export const update = mutation({
	args: {
		id: v.id("rooms"),
		activeSceneId: nullish(v.id("scenes")),
	},
	handler: async (ctx: EntMutationCtx, { id, ...args }) => {
		const room = await ensureRoomOwner(ctx, id)
		await ctx.table("rooms").getX(room._id).patch(args)
	},
})

export class RoomNotOwnedError extends Error {
	constructor() {
		super("Sorry, only the room owner can do that.")
	}
}

function getRoomBySlug(ctx: EntQueryCtx, slug: string) {
	return ctx.table("rooms").get("slug", slug)
}

async function normalizeRoom(ctx: EntQueryCtx, room: Ent<"rooms">) {
	const userId = await getAuthUserId(ctx)

	const activeSceneDoc =
		room.activeSceneId && (await ctx.table("scenes").get(room.activeSceneId))
	const activeScene =
		activeSceneDoc && (await normalizeScene(ctx, activeSceneDoc))

	return {
		...room,
		isOwner: room.ownerId === userId,
		activeScene,
	}
}

export async function ensureRoomOwner(ctx: EntQueryCtx, id: Id<"rooms">) {
	const room = await ctx.table("rooms").getX(id)
	const normalizedRoom = await normalizeRoom(ctx, room)
	if (!normalizedRoom.isOwner) {
		throw new RoomNotOwnedError()
	}
	return room
}
