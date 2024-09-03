import { ConvexEffectError } from "@maple/convex-effect"
import { v } from "convex/values"
import { Effect, pipe } from "effect"
import { Doc, Id } from "../_generated/dataModel"
import { LocalQueryContext, mutation, query } from "../lib/api.ts"
import { getAuthUserId } from "../lib/auth.ts"
import { getStorageUrl } from "../lib/storage.ts"
import { nullish } from "../lib/validators.ts"
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
			Effect.orElseSucceed(() => []),
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
			Effect.orElseSucceed(() => null),
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
		Effect.gen(function* () {
			const room = yield* queryRoomBySlug(ctx, args.slug).firstOrNull()
			if (room) {
				return yield* new ConvexEffectError(
					`The slug "${args.slug}" is already taken`,
				)
			}
			const userId = yield* getAuthUserId(ctx)
			yield* ctx.db.insert("rooms", { ...args, ownerId: userId })
		}).pipe(Effect.orDie),
})

export const update = mutation({
	args: {
		id: v.id("rooms"),
		activeSceneId: nullish(v.id("scenes")),
	},
	handler: (ctx, { id, ...args }) => {
		return pipe(
			ensureRoomOwner(ctx, id),
			Effect.flatMap((room) => ctx.db.patch(room._id, args)),
			Effect.orDie,
		)
	},
})

export class RoomNotOwnedError extends ConvexEffectError {
	constructor() {
		super("Sorry, only the room owner can do that.")
	}
}

export function getRoomBySlug(ctx: LocalQueryContext, slug: string) {
	return queryRoomBySlug(ctx, slug).first()
}

function queryRoomBySlug(ctx: LocalQueryContext, slug: string) {
	return ctx.db.query("rooms").withIndex("slug", (q) => q.eq("slug", slug))
}

export function normalizeRoom(ctx: LocalQueryContext, room: Doc<"rooms">) {
	return Effect.gen(function* () {
		const userId = yield* getAuthUserId(ctx)

		const activeSceneBackgroundUrl = yield* pipe(
			Effect.fromNullable(room.activeSceneId),
			Effect.flatMap((sceneId) => ctx.db.get(sceneId)),
			Effect.flatMap((scene) =>
				Effect.fromNullable(
					scene.dayBackgroundId ??
						scene.eveningBackgroundId ??
						scene.nightBackgroundId,
				),
			),
			Effect.flatMap((id) => getStorageUrl(ctx, id)),
			Effect.orElseSucceed(() => null),
		)

		return {
			...room,
			isOwner: room.ownerId === userId,
			activeSceneBackgroundUrl,
		}
	})
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
