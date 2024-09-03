import { partial } from "convex-helpers/validators"
import { v } from "convex/values"
import { Console, Effect, Array as EffectArray, Order, pipe } from "effect"
import { Doc, Id } from "../_generated/dataModel"
import { LocalQueryContext, mutation, query } from "../lib/api.ts"
import schema from "../schema.ts"
import { ensureRoomOwner, normalizeRoom } from "./rooms.ts"

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
		...partial(schema.tables.scenes.validator.fields),
		roomId: v.id("rooms"),
		backgroundIds: v.optional(v.array(v.id("_storage"))),
	},
	handler(ctx, { backgroundIds = [], ...args }) {
		return Effect.gen(function* () {
			yield* ensureRoomOwner(ctx, args.roomId)

			const id = yield* ctx.db.insert("scenes", {
				...args,
				name: args.name ?? "New Scene",
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
		const room = yield* normalizeRoom(ctx, yield* ctx.db.get(scene.roomId))

		const dayBackgroundUrl = yield* getImageUrl(ctx, scene.dayBackgroundId)
		const eveningBackgroundUrl = yield* getImageUrl(
			ctx,
			scene.eveningBackgroundId,
		)
		const nightBackgroundUrl = yield* getImageUrl(ctx, scene.nightBackgroundId)

		// TODO: get active scene based on game time
		const activeBackgroundUrl = dayBackgroundUrl

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

function getImageUrl(
	ctx: LocalQueryContext,
	id: Id<"_storage"> | undefined | null,
) {
	return pipe(
		Effect.fromNullable(id),
		Effect.flatMap((id) => ctx.storage.getUrl(id)),
		Effect.tapErrorTag("FileNotFound", (error) =>
			Console.warn(`File missing:`, error.info),
		),
		Effect.orElseSucceed(() => null),
	)
}
