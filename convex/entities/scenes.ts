import { partial } from "convex-helpers/validators"
import { v } from "convex/values"
import {
	EntMutationCtx,
	EntQueryCtx,
	mutation,
	query,
	type Ent,
} from "../lib/ents.ts"
import schema from "../schema.ts"
import { ensureRoomOwner } from "./rooms.ts"

export const list = query({
	args: {
		roomId: v.id("rooms"),
		search: v.optional(v.string()),
	},
	handler: async (ctx: EntQueryCtx, args) => {
		// await ensureRoomOwner(ctx, args.roomId)

		const scenes =
			args.search ?
				ctx
					.table("scenes")
					.search("name", (q) =>
						q.search("name", args.search ?? "").eq("roomId", args.roomId),
					)
			:	ctx.table("scenes", "roomId", (q) => q.eq("roomId", args.roomId))

		const normalizedScenes = await scenes.map((scene) =>
			normalizeScene(ctx, scene),
		)
		return normalizedScenes.sort((a, b) => a.name.localeCompare(b.name))
	},
})

export const get = query({
	args: {
		id: v.id("scenes"),
	},
	handler: async (ctx: EntQueryCtx, args) => {
		const { scene } = await ensureSceneRoomOwner(ctx, args.id)
		return scene ? normalizeScene(ctx, scene) : null
	},
})

export const getActive = query({
	args: {
		roomId: v.id("rooms"),
	},
	handler: async (ctx: EntQueryCtx, args) => {
		const room = await ctx.table("rooms").get(args.roomId)
		const scene =
			room?.activeSceneId && (await ctx.table("scenes").get(room.activeSceneId))
		return scene && normalizeScene(ctx, scene)
	},
})

export const create = mutation({
	args: {
		...schema.tables.scenes.validator.fields,
		name: v.optional(v.string()),
		mode: v.optional(v.union(v.literal("scenery"), v.literal("battlemap"))),
		roomId: v.id("rooms"),
		backgroundIds: v.optional(v.array(v.id("_storage"))),
	},
	handler: async (ctx: EntMutationCtx, { backgroundIds = [], ...args }) => {
		await ensureRoomOwner(ctx, args.roomId)

		return await ctx.table("scenes").insert({
			...args,
			name: args.name ?? "New Scene",
			mode: args.mode ?? "battlemap",
		})
	},
})

export const update = mutation({
	args: {
		...partial(schema.tables.scenes.validator.fields),
		id: v.id("scenes"),
	},
	handler: async (ctx: EntMutationCtx, { id, ...args }) => {
		const { scene } = await ensureSceneRoomOwner(ctx, id)
		await ctx.table("scenes").getX(scene._id).patch(args)
	},
})

export const remove = mutation({
	args: {
		sceneIds: v.array(v.id("scenes")),
	},
	handler: async (ctx: EntMutationCtx, args) => {
		for (const id of args.sceneIds) {
			const { scene } = await ensureSceneRoomOwner(ctx, id)
			await ctx.table("scenes").getX(scene._id).delete()
		}
	},
})

export const duplicate = mutation({
	args: {
		sceneIds: v.array(v.id("scenes")),
	},
	handler: async (ctx: EntMutationCtx, args) => {
		for (const id of args.sceneIds) {
			const { scene } = await ensureSceneRoomOwner(ctx, id)
			const { _id, _creationTime, ...rest } = scene
			await ctx.table("scenes").insert({
				...rest,
				name: `${scene.name} Copy`,
			})
		}
	},
})

export async function normalizeScene(ctx: EntQueryCtx, scene: Ent<"scenes">) {
	const room = await ctx.table("rooms").getX(scene.roomId)

	const sceneryBackgroundUrl =
		scene.sceneryBackgroundId ?
			await ctx.storage.getUrl(scene.sceneryBackgroundId)
		:	null

	const battlemapBackgroundUrl =
		scene.battlemapBackgroundId ?
			await ctx.storage.getUrl(scene.battlemapBackgroundId)
		:	null

	return {
		...scene,
		mode: scene.mode ?? "battlemap",
		sceneryBackgroundUrl,
		battlemapBackgroundUrl,
		cellSize: scene.cellSize ?? 140,
		isActive: room.activeSceneId === scene._id,
	}
}

async function ensureSceneRoomOwner(ctx: EntQueryCtx, id: any) {
	const scene = await ctx.table("scenes").getX(id)
	const room = await ensureRoomOwner(ctx, scene.roomId)
	return { scene, room }
}
