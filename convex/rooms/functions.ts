import { ConvexError, v } from "convex/values"
import { Effect, pipe } from "effect"
import { generateSlug } from "random-word-slugs"
import { Result } from "../../app/common/Result.ts"
import { omit } from "../../app/common/object.ts"
import { range } from "../../app/common/range.ts"
import type { Id } from "../_generated/dataModel.js"
import { getUserFromIdentity, getUserFromIdentityEffect } from "../auth/helpers.ts"
import {
	MutationCtxService,
	effectMutation,
	getDoc,
	queryHandlerFromEffect,
	withMutationCtx,
	withQueryCtx,
} from "../helpers/effect.js"
import { type QueryCtx, mutation, query } from "../helpers/ents.ts"
import { RoomModel } from "./RoomModel.js"
import { memberValidator } from "./combat/types.ts"
import { roomProperties } from "./types.ts"

export const get = query({
	args: { slug: v.string() },
	handler: queryHandlerFromEffect((args) =>
		Effect.gen(function* () {
			const room = yield* pipe(
				withQueryCtx((ctx) => ctx.table("rooms").get("slug", args.slug)),
				Effect.flatMap(Effect.fromNullable),
			)

			const players = yield* withQueryCtx((ctx) =>
				ctx.table("rooms").get(room._id).edge("players").docs(),
			)

			const playerUserIds = players?.map((it) => it.userId) ?? []
			const playerUsers = yield* pipe(
				withQueryCtx((ctx) =>
					ctx
						.table("users")
						.filter((q) => q.or(...playerUserIds.map((id) => q.eq(q.field("clerkId"), id))))
						.docs(),
				),
			)

			const identityUser = yield* getUserFromIdentityEffect()

			return {
				...room,
				players: playerUsers,
				isOwner: identityUser.clerkId === room.ownerId,
				experience: room.experience ?? 0,
			}
		}).pipe(
			Effect.tapError(Effect.logWarning),
			Effect.orElseSucceed(() => null),
		),
	),
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

		await ctx.table("rooms").insert({
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

export const remove = mutation({
	args: { id: v.id("rooms") },
	handler: async (ctx, args) => {
		const room = await RoomModel.fromId(ctx, args.id).getValueOrThrow()
		await room.delete(ctx)
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
			const player = yield* Effect.tryPromise(() => {
				return ctx.table("players").get("by_room_and_user", args.id, user.clerkId)
			})
			if (!player) {
				yield* Effect.tryPromise(() => {
					return ctx.table("players").insert({
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
