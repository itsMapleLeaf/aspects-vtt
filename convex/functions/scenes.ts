import { partial } from "convex-helpers/validators"
import { v } from "convex/values"
import { Console, Effect, pipe } from "effect"
import { omit } from "lodash-es"
import { Doc, Id } from "../_generated/dataModel"
import { LocalQueryContext, mutation, query } from "../lib/api.ts"
import schema from "../schema.ts"
import { ensureRoomOwner } from "./rooms.ts"

export const list = query({
	args: {
		room: v.id("rooms"),
	},
	handler(ctx, args) {
		return pipe(
			// ensureRoomOwner(ctx, args.room),
			ctx.db.get(args.room),
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
			Effect.orElseSucceed(() => null),
		)
	},
})

export const create = mutation({
	args: {
		...omit(schema.tables.scenes.validator.fields, [
			"backgrounds",
			"activeBackgroundId",
		]),
		backgroundIds: v.array(v.id("_storage")),
	},
	handler(ctx, { backgroundIds, ...args }) {
		return Effect.gen(function* () {
			yield* ensureRoomOwner(ctx, args.roomId)

			const backgrounds = backgroundIds.map((id) => ({
				id: crypto.randomUUID(),
				imageId: id,
			}))

			return yield* ctx.db.insert("scenes", {
				...args,
				backgrounds,
				activeBackgroundId: backgrounds[0]?.id,
			})
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
	return Effect.gen(function* () {
		const activeBackgroundUrl = yield* pipe(
			scene.backgrounds.find(
				(background) => background.id === scene.activeBackgroundId,
			) ?? scene.backgrounds[0],
			Effect.fromNullable,
			Effect.flatMap((background) => ctx.storage.getUrl(background.imageId)),
			Effect.tapErrorTag("FileNotFound", (error) =>
				Console.warn(`File missing:`, error.info),
			),
			Effect.orElseSucceed(() => null),
		)

		return {
			...scene,
			activeBackgroundUrl,
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
