import { asyncMap } from "convex-helpers"
import { getManyFrom, getOneFrom } from "convex-helpers/server/relationships"
import { ConvexError, v } from "convex/values"
import { Effect, pipe } from "effect"
import { Iterator } from "iterator-helpers-polyfill"
import { generateSlug } from "random-word-slugs"
import { omit } from "../../app/helpers/object.ts"
import { Result } from "../../app/helpers/Result.ts"
import type { Id } from "../_generated/dataModel.js"
import { type QueryCtx, mutation, query } from "../_generated/server.js"
import { getUserFromIdentity, getUserFromIdentityEffect } from "../auth.ts"
import {
	Convex,
	MutationCtxService,
	effectMutation,
	effectQuery,
	getDoc,
	withMutationCtx,
	withQueryCtx,
} from "../helpers/effect.js"
import { memberValidator } from "./combat/types.ts"
import { ensureViewerOwnsRoom } from "./helpers.ts"
import { RoomModel } from "./RoomModel.js"
import { roomProperties } from "./types.ts"

export const get = effectQuery({
	args: { slug: v.string() },
	handler(args) {
		return Effect.gen(function* () {
			const room = yield* pipe(
				withQueryCtx((ctx) => getOneFrom(ctx.db, "rooms", "slug", args.slug)),
				Effect.flatMap(Effect.fromNullable),
			)

			const playerUsers = yield* withQueryCtx(async (ctx) => {
				const players = await getManyFrom(ctx.db, "players", "roomId", room._id)
				const users = await asyncMap(players, (player) =>
					getOneFrom(ctx.db, "users", "clerkId", player.userId),
				)
				return users.filter(Boolean)
			})

			const identityUser = yield* getUserFromIdentityEffect()

			return {
				...room,
				players: playerUsers, // TODO: move to a separate query
				isOwner: identityUser.clerkId === room.ownerId,
				experience: room.experience ?? 0,
			}
		}).pipe(
			Effect.tapError(Effect.logWarning),
			Effect.orElseSucceed(() => null),
		)
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
			.withIndex("userId", (q) => q.eq("userId", user.clerkId))
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
			for (const _attempt of Iterator.range(10)) {
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
		...omit(roomProperties, ["ping"]),
		id: v.id("rooms"),
		combat: v.optional(
			v.object({
				members: v.array(memberValidator),
			}),
		),
	},
	handler: async (ctx, { id, ...args }) => {
		const room = await RoomModel.fromId(ctx, id).getValueOrThrow()
		await room.update(ctx, {
			...args,
			combat: room.data.combat && {
				...room.data.combat,
				memberObjects: args.combat?.members ?? room.data.combat.members ?? undefined,
			},
		})
	},
})

export const remove = effectMutation({
	args: { slug: v.string() },
	handler(args) {
		return Effect.gen(function* () {
			const room = yield* getRoomBySlug(args.slug)
			yield* ensureViewerOwnsRoom(room._id)
			yield* Convex.db.delete(room._id)
		})
	},
})

export const join = effectMutation({
	args: {
		id: v.id("rooms"),
	},
	handler: (args) =>
		Effect.gen(function* () {
			const ctx = yield* MutationCtxService
			const user = yield* getUserFromIdentityEffect()
			const player = yield* Effect.promise(() => {
				return ctx.db
					.query("players")
					.withIndex("roomId_userId", (q) => q.eq("roomId", args.id).eq("userId", user.clerkId))
					.first()
			})
			if (!player) {
				yield* Effect.promise(() => {
					return ctx.db.insert("players", {
						roomId: args.id,
						userId: user.clerkId,
					})
				})
			}
		}),
})

export const ping = effectMutation({
	args: {
		roomId: v.id("rooms"),
		position: v.object({ x: v.number(), y: v.number() }),
		key: v.string(),
	},
	handler(args) {
		return Effect.gen(function* () {
			const user = yield* getUserFromIdentityEffect()
			yield* withMutationCtx((ctx) =>
				ctx.db.patch(args.roomId, {
					ping: {
						position: args.position,
						name: user.name,
						colorHue: user._creationTime % 360,
						key: args.key,
					},
				}),
			)
		})
	},
})

export function isRoomOwner(roomId: Id<"rooms">) {
	return Effect.isSuccess(getRoomAsOwner(roomId))
}

export function getRoomAsOwner(roomId: Id<"rooms">) {
	return Effect.filterOrFail(
		Effect.all({
			room: getDoc(roomId),
			user: getUserFromIdentityEffect(),
		}),
		({ room, user }) => room.ownerId === user.clerkId,
		() => new ConvexError("You do not own this room."),
	)
}

export function requireRoomOwner(ctx: QueryCtx, roomId: Id<"rooms">) {
	return Result.fn(async () => {
		const room = await RoomModel.fromId(ctx, roomId).getValueOrThrow()
		await room.assertOwned()
		return room
	})
}

export function getRoomBySlug(slug: string) {
	return Convex.db
		.query("rooms")
		.withIndex("slug", (q) => q.eq("slug", slug))
		.first()
}
