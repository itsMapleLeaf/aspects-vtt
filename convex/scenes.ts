import { v } from "convex/values"
import type { Doc } from "./_generated/dataModel"
import { InaccessibleError, ensureUserId } from "./auth.ts"
import { mutation, query } from "./lib/ents.ts"
import { partial, tableFields } from "./lib/validators.ts"
import { isRoomOwner } from "./rooms.ts"

export const list = query({
	args: {
		roomId: v.id("rooms"),
		search: v.optional(v.string()),
	},
	async handler(ctx, { roomId, search }) {
		try {
			const userId = await ensureUserId(ctx)
			const room = await ctx.table("rooms").getX(roomId)

			if (!isRoomOwner(room, userId)) {
				return []
			}

			let scenesQuery
			if (search) {
				scenesQuery = ctx
					.table("scenes")
					.search("name", (q) => q.search("name", search).eq("roomId", roomId))
			} else {
				scenesQuery = ctx.table("scenes", "roomId", (q) =>
					q.eq("roomId", roomId),
				)
			}

			const scenes = await scenesQuery
			return scenes.map(normalizeScene)
		} catch (error) {
			return []
		}
	},
})

export const get = query({
	args: {
		sceneId: v.id("scenes"),
	},
	async handler(ctx, args) {
		try {
			const userId = await ensureUserId(ctx)
			const scene = await ctx.table("scenes").getX(args.sceneId)
			const room = await scene.edgeX("room")

			const isAuthorized =
				room.activeSceneId === args.sceneId || isRoomOwner(room, userId)

			if (!isAuthorized) {
				return null
			}

			return normalizeScene(scene)
		} catch (error) {
			return null
		}
	},
})

export const create = mutation({
	args: {
		...tableFields("scenes"),
		name: v.optional(v.string()),
		mode: v.optional(v.union(v.literal("scenery"), v.literal("battlemap"))),
		roomId: v.id("rooms"),
		backgroundIds: v.optional(v.array(v.id("_storage"))),
	},
	async handler(ctx, args) {
		const userId = await ensureUserId(ctx)
		const room = await ctx.table("rooms").getX(args.roomId)

		if (!isRoomOwner(room, userId)) {
			throw new InaccessibleError({
				id: args.roomId,
				table: "rooms",
			})
		}

		const { backgroundIds = [], ...sceneArgs } = args
		return await ctx.table("scenes").insert({
			...sceneArgs,
			name: args.name ?? "New Scene",
			mode: args.mode ?? "battlemap",
		})
	},
})

export const update = mutation({
	args: {
		...partial(tableFields("scenes")),
		sceneId: v.id("scenes"),
	},
	async handler(ctx, args) {
		const userId = await ensureUserId(ctx)
		const scene = await ctx.table("scenes").getX(args.sceneId)
		const room = await scene.edgeX("room")

		if (!isRoomOwner(room, userId)) {
			throw new InaccessibleError({
				id: room._id,
				table: "rooms",
			})
		}

		const { sceneId, ...updateArgs } = args
		await scene.patch(updateArgs)
	},
})

export const remove = mutation({
	args: {
		sceneIds: v.array(v.id("scenes")),
	},
	async handler(ctx, args) {
		const userId = await ensureUserId(ctx)
		for (const sceneId of args.sceneIds) {
			const scene = await ctx.table("scenes").getX(sceneId)
			const room = await scene.edgeX("room")

			if (!isRoomOwner(room, userId)) {
				throw new InaccessibleError({
					id: room._id,
					table: "rooms",
				})
			}
			await scene.delete()
		}
	},
})

export const duplicate = mutation({
	args: {
		sceneIds: v.array(v.id("scenes")),
	},
	async handler(ctx, args) {
		const userId = await ensureUserId(ctx)
		for (const sceneId of args.sceneIds) {
			const scene = await ctx.table("scenes").getX(sceneId)
			const room = await scene.edgeX("room")

			if (!isRoomOwner(room, userId)) {
				throw new InaccessibleError({
					id: room._id,
					table: "rooms",
				})
			}

			const { _id, _creationTime, ...properties } = scene
			await ctx.table("scenes").insert({
				...properties,
				name: `Copy of ${scene.name}`,
			})
		}
	},
})

export function normalizeScene(scene: Doc<"scenes">) {
	return {
		...scene,
		mode: scene.mode ?? "battlemap",
		cellSize: scene.cellSize ?? 140,
	}
}
