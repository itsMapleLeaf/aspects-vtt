import { nullable } from "convex-helpers/validators"
import { ConvexError, v } from "convex/values"
import { generateSlug } from "random-word-slugs"
import { range } from "#app/common/range.js"
import { CharacterModel } from "./CharacterModel.js"
import { RoomModel } from "./RoomModel.js"
import { type QueryCtx, mutation, query } from "./_generated/server.js"
import { getUserFromIdentity } from "./users.js"

export const roomProperties = {
	name: v.optional(v.string()),
	mapImageId: v.optional(v.id("_storage")),
	mapDimensions: v.optional(v.object({ width: v.number(), height: v.number() })),
	mapCellSize: v.optional(v.number()),
	experience: v.optional(v.number()),
	combat: v.optional(
		nullable(
			v.object({
				members: v.array(v.id("characters")),
				currentMemberIndex: v.number(),
				currentRoundNumber: v.number(),
			}),
		),
	),
}

export const get = query({
	args: { slug: v.string() },
	handler: async (ctx, args) => {
		return await RoomModel.fromSlug(ctx, args.slug)
			.map(async (room) => {
				const players = await room.getPlayers()

				const playerUsers = await Promise.all(
					players.map(async (player) => {
						const user = await ctx.db
							.query("users")
							.withIndex("by_clerk_id", (q) => q.eq("clerkId", player.userId))
							.first()
						if (!user) return null
						return { name: user.name, clerkId: user.clerkId, avatarUrl: user.avatarUrl }
					}),
				)

				return {
					...room.data,
					experience: room.data.experience ?? 0,
					isOwner: await room.isOwner(),
					players: playerUsers.filter(Boolean),
					combat: room.data.combat && {
						...room.data.combat,
						members: (
							await Promise.all(
								room.data.combat.members.map(async (memberId) => {
									const model = await CharacterModel.get(ctx, memberId).getValueOrNull()
									return model?.getComputedData()
								}),
							)
						).filter(Boolean),
					},
				}
			})
			.resolveJson()
	},
})

export const list = query({
	handler: async (ctx: QueryCtx) => {
		const { value: user, error: userError } = await getUserFromIdentity(ctx)
		if (!user) {
			console.warn("Attempted to list rooms without a user.", userError)
			return []
		}

		const memberships = await ctx.db
			.query("players")
			.withIndex("by_user", (q) => q.eq("userId", user.clerkId))
			.collect()

		const rooms = await Promise.all(memberships.map((player) => ctx.db.get(player.roomId)))
		return rooms.filter(Boolean)
	},
})

export const create = mutation({
	handler: async (ctx) => {
		const user = await getUserFromIdentity(ctx).getValueOrThrow()
		const slug = await generateUniqueSlug(ctx)

		await ctx.db.insert("rooms", {
			name: slug,
			slug,
			ownerId: user.clerkId,
		})

		return { slug }

		async function generateUniqueSlug(ctx: QueryCtx): Promise<string> {
			for (const _attempt of range(10)) {
				const slug = generateSlug()
				const existing = await RoomModel.fromSlug(ctx, slug)
				if (!existing.value) return slug
			}
			throw new ConvexError("Failed to generate a unique slug")
		}
	},
})

export const update = mutation({
	args: {
		id: v.id("rooms"),
		...roomProperties,
		combat: v.optional(
			v.object({
				members: v.array(v.id("characters")),
			}),
		),
	},
	handler: async (ctx, { id, ...args }) => {
		const room = await RoomModel.fromId(ctx, id).getValueOrThrow()
		await room.update(ctx, {
			...args,
			combat: room.data.combat && {
				...room.data.combat,
				members: args.combat?.members ?? room.data.combat.members,
			},
		})
	},
})

export const remove = mutation({
	args: { id: v.id("rooms") },
	handler: async (ctx, args) => {
		const room = await RoomModel.fromId(ctx, args.id).getValueOrThrow()
		await room.delete(ctx)
	},
})

export const join = mutation({
	args: {
		id: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		const room = await RoomModel.fromId(ctx, args.id).getValueOrThrow()
		await room.join(ctx)
	},
})
