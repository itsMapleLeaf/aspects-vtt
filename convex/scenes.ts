import { v } from "convex/values"
import { generateSlug } from "random-word-slugs"
import type { Id } from "#convex/_generated/dataModel.js"
import { type QueryCtx, mutation, query } from "#convex/_generated/server.js"
import { requireDoc } from "./helpers.ts"
import { requireRoomOwner } from "./rooms.ts"
import { sceneCharacterProperties } from "./scenes/characters.ts"

const sceneUpdateProperties = {
	name: v.string(),
	cellSize: v.number(),
}

export const sceneProperties = {
	...sceneUpdateProperties,
	roomId: v.id("rooms"),
	characterTokens: v.array(v.object(sceneCharacterProperties)),
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

export const create = mutation({
	args: {
		roomId: v.id("rooms"),
	},
	async handler(ctx, args) {
		await requireRoomOwner(ctx, args.roomId).getValueOrThrow()
		return await ctx.db.insert("scenes", {
			name: generateSlug(2),
			roomId: args.roomId,
			cellSize: 70,
			characterTokens: [],
		})
	},
})

export const update = mutation({
	args: {
		...sceneUpdateProperties,
		id: v.id("scenes"),
	},
	async handler(ctx, { id, ...args }) {
		await requireSceneRoomOwner(ctx, id).getValueOrThrow()
		return await ctx.db.patch(id, {
			name: args.name,
			cellSize: args.cellSize,
		})
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
	})
}
