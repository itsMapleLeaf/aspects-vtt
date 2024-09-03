import { partial } from "convex-helpers/validators"
import { v } from "convex/values"
import { Effect, Array as EffectArray, Order, pipe } from "effect"
import { Doc, Id } from "../_generated/dataModel"
import { LocalQueryContext, mutation, query } from "../lib/api.ts"
import { getStorageUrl } from "../lib/storage.ts"
import schema from "../schema.ts"
import { ensureRoomOwner } from "./rooms.ts"

export const list = query({
	args: {
		room: v.id("rooms"),
		search: v.optional(v.string()),
	},
	handler(ctx, args) {
		return pipe(
			ensureRoomOwner(ctx, args.room),
			Effect.flatMap((room) => {
				let query
				query = ctx.db.query("scenes")
				if (args.search) {
					query = query.withSearchIndex("name", (q) =>
						q.search("name", args.search ?? "").eq("roomId", room._id),
					)
				} else {
					query = query.withIndex("roomId", (q) => q.eq("roomId", room._id))
				}
				return query.collect()
			}),
			Effect.flatMap(
				Effect.forEach((scene) => normalizeScene(ctx, scene), {
					concurrency: "unbounded",
				}),
			),
			Effect.map(
				EffectArray.sortBy(Order.mapInput(Order.string, (scene) => scene.name)),
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
			Effect.orElseSucceed(() => null),
		)
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
	handler(ctx, { backgroundIds = [], ...args }) {
		return Effect.gen(function* () {
			yield* ensureRoomOwner(ctx, args.roomId)

			const id = yield* ctx.db.insert("scenes", {
				...args,
				name: args.name ?? "New Scene",
				mode: args.mode ?? "battlemap",
			})

			return yield* normalizeScene(ctx, yield* ctx.db.get(id))
		}).pipe(Effect.orDie)
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
		ids: v.array(v.id("scenes")),
	},
	handler(ctx, args) {
		return pipe(
			Effect.forEach(args.ids, (id) =>
				pipe(
					ensureSceneRoomOwner(ctx, id),
					Effect.flatMap(({ scene }) => ctx.db.delete(scene._id)),
				),
			),
			Effect.orDie,
			Effect.asVoid,
		)
	},
})

export function normalizeScene(ctx: LocalQueryContext, scene: Doc<"scenes">) {
	return Effect.gen(function* () {
		const room = yield* ctx.db.get(scene.roomId)

		const dayBackgroundUrl = yield* pipe(
			Effect.fromNullable(scene.dayBackgroundId),
			Effect.flatMap((id) => getStorageUrl(ctx, id)),
			Effect.orElseSucceed(() => null),
		)

		const eveningBackgroundUrl = yield* pipe(
			Effect.fromNullable(scene.eveningBackgroundId),
			Effect.flatMap((id) => getStorageUrl(ctx, id)),
			Effect.orElseSucceed(() => null),
		)

		const nightBackgroundUrl = yield* pipe(
			Effect.fromNullable(scene.nightBackgroundId),
			Effect.flatMap((id) => getStorageUrl(ctx, id)),
			Effect.orElseSucceed(() => null),
		)

		// TODO: get active scene based on game time
		const activeBackgroundUrl =
			dayBackgroundUrl ?? eveningBackgroundUrl ?? nightBackgroundUrl

		return {
			...scene,
			isActive: room.activeSceneId === scene._id,
			dayBackgroundUrl,
			eveningBackgroundUrl,
			nightBackgroundUrl,
			activeBackgroundUrl,
			mode: scene.mode ?? { type: "battlemap", cellSize: 70 },
		}
	})
}

export function ensureSceneRoomOwner(ctx: LocalQueryContext, id: Id<"scenes">) {
	return Effect.gen(function* () {
		const scene = yield* ctx.db.get(id)
		const room = yield* ensureRoomOwner(ctx, scene.roomId)
		return { scene, room }
	})
}
