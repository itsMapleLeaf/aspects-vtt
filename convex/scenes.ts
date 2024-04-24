import { deprecated, nullable, partial } from "convex-helpers/validators"
import { v } from "convex/values"
import { generateSlug } from "random-word-slugs"
import type { Id } from "#convex/_generated/dataModel.js"
import { type QueryCtx, mutation, query } from "#convex/_generated/server.js"
import { RoomModel } from "./RoomModel.ts"
import { requireDoc } from "./helpers.ts"
import { requireRoomOwner } from "./rooms.ts"
import { sceneTokenProperties } from "./scenes/tokens.ts"

const sceneUpdateProperties = {
	name: v.string(),
	background: nullable(v.id("_storage")),
	backgroundDimensions: v.optional(v.object({ x: v.number(), y: v.number() })),
	cellSize: v.number(),
}

export const sceneProperties = {
	...sceneUpdateProperties,
	roomId: v.id("rooms"),
	tokens: v.optional(v.array(v.object(sceneTokenProperties))),
	characterTokens: deprecated,
}

export const list = query({
	args: {
		roomId: v.id("rooms"),
	},
	async handler(ctx, args) {
		return await requireRoomOwner(ctx, args.roomId)
			.map(() => ctx.db.query("scenes").collect())
			.getValueOrDefault([])
	},
})

export const getCurrent = query({
	args: {
		roomId: v.id("rooms"),
	},
	async handler(ctx, args) {
		const room = await RoomModel.fromId(ctx, args.roomId).getValueOrNull()
		const currentScene = room?.data.currentScene
		if (!currentScene) return null

		return await ctx.db
			.query("scenes")
			.filter((q) => q.eq(q.field("_id"), currentScene))
			.first()
	},
})

export const create = mutation({
	args: {
		roomId: v.id("rooms"),
	},
	async handler(ctx, args) {
		await requireRoomOwner(ctx, args.roomId).getValueOrThrow()
		return await ctx.db.insert("scenes", {
			name: generateSlug(2, {
				format: "title",
				categories: {
					noun: ["place"],
					adjective: ["appearance", "color", "condition", "shapes", "size", "sounds"],
				},
			}),
			background: null,
			roomId: args.roomId,
			cellSize: 70,
		})
	},
})

export const duplicate = mutation({
	args: {
		id: v.id("scenes"),
	},
	async handler(ctx, args) {
		const { _id, _creationTime, ...properties } = await requireSceneRoomOwner(
			ctx,
			args.id,
		).getValueOrThrow()
		return await ctx.db.insert("scenes", properties)
	},
})

export const update = mutation({
	args: {
		...partial(sceneUpdateProperties),
		id: v.id("scenes"),
		backgroundDimensions: v.optional(v.object({ x: v.number(), y: v.number() })),
	},
	async handler(ctx, { id, ...args }) {
		await requireSceneRoomOwner(ctx, id).getValueOrThrow()
		return await ctx.db.patch(id, args)
	},
})

export const remove = mutation({
	args: {
		id: v.id("scenes"),
	},
	async handler(ctx, args) {
		await requireSceneRoomOwner(ctx, args.id).getValueOrThrow()
		return await ctx.db.delete(args.id)
	},
})

export function requireSceneRoomOwner(ctx: QueryCtx, id: Id<"scenes">) {
	return requireDoc(ctx, id, "scenes").map(async (scene) => {
		await requireRoomOwner(ctx, scene.roomId)
		return scene
	})
}
