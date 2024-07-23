import { getOneFrom } from "convex-helpers/server/relationships"
import { ConvexError, v } from "convex/values"
import { Effect, pipe } from "effect"
import { generateSlug } from "random-word-slugs"
import { Result } from "../../app/helpers/Result.ts"
import { omit } from "../../app/helpers/object.ts"
import type { Id } from "../_generated/dataModel.js"
import { mutation, query, type QueryCtx } from "../_generated/server.js"
import { UnauthorizedError, getUserFromIdentity, getUserFromIdentityEffect } from "../auth.ts"
import {
	Convex,
	MutationCtxService,
	effectMutation,
	effectQuery,
	withMutationCtx,
	withQueryCtx,
} from "../helpers/effect.js"
import schema from "../schema.ts"
import { getCurrentUser, getCurrentUserId } from "../users.ts"
import { RoomModel } from "./RoomModel.js"
import { memberValidator } from "./combat/types.ts"
import { ensureViewerOwnsRoom } from "./helpers.ts"

export const get = effectQuery({
	args: { slug: v.string() },
	handler(args) {
		return Effect.gen(function* () {
			const room = yield* pipe(
				withQueryCtx((ctx) => getOneFrom(ctx.db, "rooms", "slug", args.slug)),
				Effect.flatMap(Effect.fromNullable),
			)

			const players = yield* Convex.db
				.query("players")
				.withIndex("roomId", (q) => q.eq("roomId", room._id))
				.collect()

			const playerUsers = yield* pipe(
				players.map((it) => it.user).filter(Boolean),
				Effect.forEach((id) =>
					pipe(
						Convex.db.get(id),
						Effect.catchTag("ConvexDocNotFoundError", () => Effect.succeed(null)),
					),
				),
			)

			const currentUserId = yield* getCurrentUserId()

			return {
				...room,
				players: playerUsers.filter(Boolean), // TODO: move to a separate query
				isOwner: currentUserId === room.owner,
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
			.withIndex("user", (q) => q.eq("user", user._id))
			.collect()

		const rooms = await Promise.all(memberships.map((player) => ctx.db.get(player.roomId)))
		return rooms.filter(Boolean)
	},
})

export const create = effectMutation({
	handler: () => {
		return Effect.gen(function* () {
			const user = yield* getCurrentUser()
			const slug = yield* pipe(generateUniqueSlug, Effect.retry({ times: 10 }))

			yield* Convex.db.insert("rooms", {
				name: slug,
				slug,
				owner: user._id,
			})

			return { slug }
		})
	},
})

const generateUniqueSlug = Effect.gen(function* () {
	const slug = generateSlug()
	const existing = yield* getRoomBySlug(slug)
	if (!existing) {
		return slug
	}
	return yield* Effect.fail(new ConvexError("A room with that slug already exists"))
})

export const update = mutation({
	args: {
		...omit(schema.tables.rooms.validator.fields, ["ping"]),
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
			const user = yield* getCurrentUser()
			const player = yield* Effect.promise(() => {
				return ctx.db
					.query("players")
					.withIndex("roomId_user", (q) => q.eq("roomId", args.id).eq("user", user._id))
					.first()
			})
			if (!player) {
				yield* Effect.promise(() => {
					return ctx.db.insert("players", {
						roomId: args.id,
						user: user._id,
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
	return pipe(
		Effect.all([Convex.db.get(roomId), getCurrentUserId()]),
		Effect.filterOrFail(
			([room, user]) => room.owner === user,
			() => new UnauthorizedError(),
		),
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
