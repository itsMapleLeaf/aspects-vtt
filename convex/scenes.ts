import { deprecated, nullable, partial } from "convex-helpers/validators"
import { v } from "convex/values"
import { RoomModel } from "./RoomModel.ts"
import type { Id } from "./_generated/dataModel.js"
import { type QueryCtx, mutation, query } from "./_generated/server.js"
import { requireDoc } from "./helpers.ts"
import { requireRoomOwner } from "./rooms.ts"
import { createToken, sceneTokenProperties } from "./scenes/tokens.ts"

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
		name: v.string(),
	},
	async handler(ctx, args) {
		const room = await requireRoomOwner(ctx, args.roomId).getValueOrThrow()

		const players = await ctx.db
			.query("players")
			.withIndex("by_room", (q) => q.eq("roomId", room.data._id))
			.collect()

		const characters = ctx.db
			.query("characters")
			.filter((q) => q.or(...players.map((player) => q.eq(q.field("playerId"), player.userId))))

		return await ctx.db.insert("scenes", {
			...args,
			background: null,
			cellSize: 70,
			tokens: await Array.fromAsync(characters, (character, index) =>
				createToken({
					position: { x: index * 70, y: 0 },
					visible: true,
					characterId: character._id,
				}),
			),
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
