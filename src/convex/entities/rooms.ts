import { ConvexEffectError } from "@maple/convex-effect"
import { v } from "convex/values"
import { Effect, pipe } from "effect"
import { Nullish } from "../../common/types.ts"
import { Doc, Id } from "../_generated/dataModel"
import { LocalQueryContext, mutation, query } from "../lib/api.ts"
import { getAuthUserId } from "../lib/auth.ts"
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
	handler: (ctx, args) =>
		pipe(
			ctx.db.get(args.id),
			Effect.flatMap((room) => normalizeRoom(ctx, room)),
			Effect.orElseSucceed(() => null),
		),
})

export const getBySlug = query({
	args: {
		slug: v.string(),
		previewSceneId: nullish(v.string()),
	},
	handler(ctx, { slug, previewSceneId }) {
		// return pipe(
		// 	getRoomBySlug(ctx, slug),
		// 	Effect.flatMap((room) => normalizeRoom(ctx, room, previewSceneId)),
		// 	Effect.orElseSucceed(() => null),
		// )
		return Effect.gen(function* () {
			const room = yield* getRoomBySlug(ctx, slug)
			const normalizedPreviewSceneId =
				previewSceneId ?
					yield* ctx.db.normalizeId("scenes", previewSceneId)
				:	undefined
			return yield* normalizeRoom(ctx, room, normalizedPreviewSceneId)
		}).pipe(Effect.orElseSucceed(() => null))
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

export function normalizeRoom(
	ctx: LocalQueryContext,
	room: Doc<"rooms">,
	previewSceneId?: Nullish<Id<"scenes">>,
) {
	return Effect.gen(function* () {
		const userId = yield* getAuthUserId(ctx)

		const activeScene = yield* pipe(
			Effect.fromNullable(previewSceneId ?? room.activeSceneId),
			Effect.flatMap((sceneId) => ctx.db.get(sceneId)),
			Effect.flatMap((scene) => normalizeScene(ctx, scene)),
			Effect.orElseSucceed(() => null),
		)

		return {
			...room,
			isOwner: room.ownerId === userId,
			activeScene,
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
