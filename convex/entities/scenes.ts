import { v } from "convex/values"
import { partial } from "lodash-es"
import {
	InaccessibleError,
	protectedMutationHandler,
	protectedQueryHandler,
} from "../lib/auth.ts"
import { mutation, query } from "../lib/ents.ts"
import schema from "../schema.ts"
import { isRoomOwner } from "./rooms.ts"

export const list = query({
	args: {
		roomId: v.id("rooms"),
		search: v.optional(v.string()),
	},
	handler: protectedQueryHandler(
		[],
		async (ctx, userId, { roomId, search }) => {
			const room = await ctx.table("rooms").get(roomId)
			if (room == null || !isRoomOwner(room, userId)) {
				return []
			}

			let scenes
			if (search) {
				await ctx
					.table("scenes")
					.search("name", (q) => q.search("name", search).eq("roomId", roomId))
			} else {
				await ctx.table("scenes", "roomId", (q) => q.eq("roomId", roomId))
			}

			return scenes
		},
	),
})

export const get = query({
	args: {
		sceneId: v.id("scenes"),
	},
	handler: protectedQueryHandler(null, async (ctx, userId, { sceneId }) => {
		const scene = ctx.table("scenes").get(sceneId)
		if (!scene) return null

		const room = await scene.edge("room")
		if (room == null || !isRoomOwner(room, userId)) {
			return null
		}

		return scene
	}),
})

export const create = mutation({
	args: {
		...schema.tables.scenes.validator.fields,
		name: v.optional(v.string()),
		mode: v.optional(v.union(v.literal("scenery"), v.literal("battlemap"))),
		roomId: v.id("rooms"),
		backgroundIds: v.optional(v.array(v.id("_storage"))),
	},
	handler: protectedMutationHandler(
		async (ctx, userId, { backgroundIds = [], ...args }) => {
			const room = await ctx.table("rooms").get(args.roomId)
			if (room == null || !isRoomOwner(room, userId)) {
				throw new InaccessibleError({
					id: args.roomId,
					collection: "rooms",
				})
			}

			return await ctx.table("scenes").insert({
				...args,
				name: args.name ?? "New Scene",
				mode: args.mode ?? "battlemap",
			})
		},
	),
})

export const update = mutation({
	args: {
		...partial(schema.tables.scenes.validator.fields),
		sceneId: v.id("scenes"),
	},
	handler: protectedMutationHandler(
		async (ctx, userId, { sceneId, ...args }) => {
			const scene = await ctx.table("scenes").getX(sceneId)
			const room = await ctx.table("rooms").getX(scene.roomId)

			if (!isRoomOwner(room, userId)) {
				throw new InaccessibleError({
					id: room._id,
					collection: "rooms",
				})
			}

			await scene.patch(args)
		},
	),
})

export const remove = mutation({
	args: {
		sceneIds: v.array(v.id("scenes")),
	},
	handler: protectedMutationHandler(async (ctx, userId, args) => {
		for (const sceneId of args.sceneIds) {
			const scene = await ctx.table("scenes").getX(sceneId)
			const room = await ctx.table("rooms").getX(scene.roomId)

			if (!isRoomOwner(room, userId)) {
				throw new InaccessibleError({
					id: room._id,
					collection: "rooms",
				})
			}
			await ctx.table("scenes").getX(scene._id).delete()
		}
	}),
})

export const duplicate = mutation({
	args: {
		sceneIds: v.array(v.id("scenes")),
	},
	handler: protectedMutationHandler(async (ctx, userId, args) => {
		for (const sceneId of args.sceneIds) {
			const scene = await ctx.table("scenes").getX(sceneId)
			const room = await ctx.table("rooms").getX(scene.roomId)

			if (!isRoomOwner(room, userId)) {
				throw new InaccessibleError({
					id: room._id,
					collection: "rooms",
				})
			}

			const { _id, _creationTime, ...properties } = scene
			await ctx.table("scenes").insert({
				...properties,
				name: `Copy of ${scene.name}`,
			})
		}
	}),
})
