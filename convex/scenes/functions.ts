import { v } from "convex/values"
import { Effect } from "effect"
import { parallel } from "~/helpers/async.ts"
import type { Id } from "../_generated/dataModel.js"
import { mutation, query, type QueryCtx } from "../_generated/server.js"
import { requireDoc } from "../helpers/convex.ts"
import { effectQuery, getDoc } from "../helpers/effect.ts"
import { partial } from "../helpers/partial.ts"
import { RoomModel } from "../rooms/RoomModel.ts"
import { requireRoomOwner } from "../rooms/functions.ts"
import { ensureViewerOwnsRoom } from "../rooms/helpers.ts"
import { vectorValidator } from "../types.ts"
import { createToken } from "./tokens/functions.ts"
import { sceneUpdateProperties } from "./types.ts"

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

export const get = effectQuery({
	args: {
		id: v.id("scenes"),
	},
	handler(args) {
		return requireSceneRoomOwner(args.id).pipe(
			Effect.map(({ scene }) => scene),
			Effect.catchTag("RoomNotOwnedError", () => Effect.succeed(null)),
			Effect.catchTag("ConvexDocNotFoundError", () => Effect.succeed(null)),
			Effect.catchTag("NotLoggedInError", () => Effect.succeed(null)),
			Effect.orDie,
		)
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
		const players = await room.getPlayers()

		const characters = await parallel(
			players,
			async (player) =>
				await ctx.db
					.query("characters")
					.withIndex("player", (q) => q.eq("player", player.user))
					.collect(),
		)

		return await ctx.db.insert("scenes", {
			...args,
			background: null,
			cellSize: 70,
			tokens: characters.flat().map((character, index) =>
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
		const { _id, _creationTime, ...properties } = await requireSceneRoomOwnerOld(
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
		backgroundDimensions: v.optional(vectorValidator()),
	},
	async handler(ctx, { id, ...args }) {
		await requireSceneRoomOwnerOld(ctx, id).getValueOrThrow()
		return await ctx.db.patch(id, args)
	},
})

export const remove = mutation({
	args: {
		id: v.id("scenes"),
	},
	async handler(ctx, args) {
		await requireSceneRoomOwnerOld(ctx, args.id).getValueOrThrow()
		return await ctx.db.delete(args.id)
	},
})

export function requireSceneRoomOwner(id: Id<"scenes">) {
	return Effect.Do.pipe(
		Effect.bind("scene", () => getDoc(id)),
		Effect.bind("room", ({ scene }) => ensureViewerOwnsRoom(scene.roomId)),
	)
}

/** @deprecated */
export function requireSceneRoomOwnerOld(ctx: QueryCtx, id: Id<"scenes">) {
	return requireDoc(ctx, id, "scenes").map(async (scene) => {
		await requireRoomOwner(ctx, scene.roomId)
		return scene
	})
}
