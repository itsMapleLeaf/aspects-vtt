import { ConvexError, type Infer, v } from "convex/values"
import { raise } from "#app/common/errors.js"
import type { Id } from "./_generated/dataModel.js"
import { type QueryCtx, mutation, query } from "./_generated/server.js"
import { requireIdentityUser } from "./auth.js"
import { requireDoc } from "./helpers.js"
import { requireOwnedRoom } from "./rooms.js"
import { replaceFile } from "./storage.js"

const characterFieldValueValidator = v.union(v.string(), v.number(), v.boolean())
export type CharacterFieldValue = Infer<typeof characterFieldValueValidator>

export const characterFieldValidator = v.object({
	key: v.string(),
	value: characterFieldValueValidator,
})
export type CharacterField = Infer<typeof characterFieldValidator>

export const list = query({
	args: {
		roomId: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("characters")
			.withIndex("by_room", (q) => q.eq("roomId", args.roomId))
			.collect()
	},
})

export const get = query({
	args: {
		id: v.string(),
	},
	handler: async (ctx, args) => {
		const id = ctx.db.normalizeId("characters", args.id)
		return await ctx.db.get(id ?? raise(`Invalid character ID: ${args.id}`))
	},
})

export const create = mutation({
	args: {
		roomId: v.id("rooms"),
		fields: v.array(characterFieldValidator),
	},
	handler: async (ctx, args) => {
		await requireOwnedRoom(ctx, args.roomId)
		return await ctx.db.insert("characters", args)
	},
})

export const update = mutation({
	args: {
		id: v.id("characters"),
		playerId: v.optional(v.id("users")),
		imageId: v.optional(v.union(v.id("_storage"), v.null())),
		fields: v.optional(
			v.array(
				v.object({
					key: v.string(),
					value: v.union(v.string(), v.number(), v.boolean()),
				}),
			),
		),
	},
	handler: async (ctx, { id, ...args }) => {
		const character = await requireDoc(ctx, "characters", id)
		if (args.playerId) {
			await requireOwnedRoom(ctx, character.roomId)
		}
		if (args.imageId || args.fields) {
			await requireOwnedCharacter(ctx, id)
		}
		await replaceFile(ctx, character.imageId, args.imageId)
		await ctx.db.patch(id, args)
	},
})

export const remove = mutation({
	args: {
		id: v.id("characters"),
	},
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id)
	},
})

async function requireOwnedCharacter(ctx: QueryCtx, characterId: Id<"characters">) {
	const user = await requireIdentityUser(ctx)
	const character = await requireDoc(ctx, "characters", characterId)
	const room = await requireDoc(ctx, "rooms", character.roomId)
	if (user._id !== character.playerId && user._id !== room.ownerId) {
		throw new ConvexError("Insufficient permissions.")
	}
}
