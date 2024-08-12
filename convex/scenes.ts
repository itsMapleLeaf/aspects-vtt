import { partial } from "convex-helpers/validators"
import { v } from "convex/values"
import { Console, Effect, pipe } from "effect"
import { Doc, Id } from "./_generated/dataModel"
import { LocalQueryContext, mutation, query } from "./lib/api.ts"
import { ensureRoomOwner } from "./rooms.ts"
import schema from "./schema.ts"

export const list = query({
	args: {
		room: v.id("rooms"),
	},
	handler(ctx, args) {
		return pipe(
			ensureRoomOwner(ctx, args.room),
			Effect.flatMap((room) =>
				ctx.db
					.query("scenes")
					.withIndex("roomId", (q) => q.eq("roomId", room._id))
					.collect(),
			),
			Effect.flatMap(
				Effect.forEach((scene) => normalizeScene(ctx, scene), {
					concurrency: "unbounded",
				}),
			),
			Effect.orElseSucceed(() => []),
		)
	},
})

export const get = query({
	args: {
		id: v.id("scenes"),
	},
	handler(ctx, args) {
		return pipe(
			ensureSceneRoomOwner(ctx, args.id),
			Effect.flatMap(({ scene }) => normalizeScene(ctx, scene)),
			Effect.catchTags({
				UnauthenticatedError: () => Effect.succeed(null),
				DocNotFound: () => Effect.succeed(null),
				RoomNotOwnedError: () => Effect.succeed(null),
			}),
		)
	},
})

export const create = mutation({
	args: schema.tables.scenes.validator.fields,
	handler(ctx, args) {
		return pipe(
			ensureRoomOwner(ctx, args.roomId),
			Effect.andThen(() => ctx.db.insert("scenes", args)),
			Effect.orDie,
		)
	},
})

export const update = mutation({
	args: {
		...partial(schema.tables.scenes.validator.fields),
		id: v.id("scenes"),
	},
	handler(ctx, { id, ...args }) {
		return pipe(
			ensureSceneRoomOwner(ctx, id),
			Effect.flatMap(({ scene }) => ctx.db.patch(scene._id, args)),
			Effect.orDie,
		)
	},
})

export const remove = mutation({
	args: {
		id: v.id("scenes"),
	},
	handler(ctx, args) {
		return pipe(
			ensureSceneRoomOwner(ctx, args.id),
			Effect.flatMap(({ scene }) => ctx.db.delete(scene._id)),
			Effect.orDie,
		)
	},
})

export function normalizeScene(ctx: LocalQueryContext, scene: Doc<"scenes">) {
	return pipe(
		Effect.fromNullable(scene.backgroundId),
		Effect.flatMap((id) => ctx.storage.getUrl(id)),
		Effect.catchTags({
			FileNotFound: (error) =>
				pipe(
					Console.warn(`File missing: ${error.info.storageId}`),
					Effect.andThen(() => Effect.succeed(null)),
				),
			NoSuchElementException: () => Effect.succeed(null),
		}),
		Effect.map((backgroundUrl) => ({
			...scene,
			backgroundUrl,
		})),
	)
}

export function ensureSceneRoomOwner(ctx: LocalQueryContext, id: Id<"scenes">) {
	return Effect.gen(function* () {
		const scene = yield* ctx.db.get(id)
		const room = yield* ensureRoomOwner(ctx, scene.roomId)
		return { scene, room }
	})
}
