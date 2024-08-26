import { ConvexError, v } from "convex/values"
import { Data, Effect, pipe } from "effect"
import { Doc, Id } from "../_generated/dataModel"
import { LocalQueryContext, mutation, query } from "../lib/api.ts"
import { getAuthUserId } from "../lib/auth.ts"
import { normalizeScene } from "./scenes.ts"

export const list = query({
	handler(ctx) {
		return pipe(
			getAuthUserId(ctx),
			Effect.flatMap((userId) =>
				ctx.db
					.query("rooms")
					.withIndex("ownerId", (q) => q.eq("ownerId", userId))
					.collect(),
			),
			Effect.catchTag("UnauthenticatedError", () => Effect.succeed([])),
		)
	},
})

export const get = query({
	args: {
		id: v.id("rooms"),
	},
	handler: (ctx, args) => ctx.db.getOrNull(args.id),
})

export const getBySlug = query({
	args: {
		slug: v.string(),
	},
	handler(ctx, { slug }) {
		return pipe(
			getRoomBySlug(ctx, slug),
			Effect.flatMap((room) => normalizeRoom(ctx, room)),
			Effect.catchTags({
				UnauthenticatedError: () => Effect.succeed(null),
				DocNotFound: () => Effect.succeed(null),
			}),
		)
	},
})

export const getActiveScene = query({
	args: {
		id: v.id("rooms"),
	},
	handler(ctx, args) {
		return Effect.gen(function* () {
			const room = yield* ctx.db.get(args.id)
			if (!room.activeSceneId) {
				return null
			}
			const scene = yield* ctx.db.get(room.activeSceneId)
			return yield* normalizeScene(ctx, scene)
		}).pipe(Effect.orElseSucceed(() => null))
	},
})

export const create = mutation({
	args: {
		name: v.string(),
		slug: v.string(),
	},
	handler: (ctx, args) =>
		pipe(
			getRoomBySlug(ctx, args.slug),
			Effect.match({
				onSuccess: () => {
					return Effect.fail(
						new ConvexError(`The slug "${args.slug}" is already taken`),
					)
				},
				onFailure: () => Effect.void,
			}),
			Effect.andThen(() => getAuthUserId(ctx)),
			Effect.flatMap((userId) =>
				ctx.db.insert("rooms", { ...args, ownerId: userId }),
			),
			Effect.orDie,
		),
})

export class RoomNotOwnedError extends Data.TaggedError("RoomNotOwnedError") {}

export function getRoomBySlug(ctx: LocalQueryContext, slug: string) {
	return ctx.db
		.query("rooms")
		.withIndex("slug", (q) => q.eq("slug", slug))
		.first()
}

export function normalizeRoom(ctx: LocalQueryContext, room: Doc<"rooms">) {
	return pipe(
		getAuthUserId(ctx),
		Effect.map((userId) => ({
			...room,
			isOwner: room.ownerId === userId,
		})),
	)
}

export function ensureRoomOwner(ctx: LocalQueryContext, id: Id<"rooms">) {
	return pipe(
		ctx.db.get(id),
		Effect.flatMap((room) => normalizeRoom(ctx, room)),
		Effect.filterOrFail(
			(room) => room.isOwner,
			() => new RoomNotOwnedError(),
		),
	)
}
