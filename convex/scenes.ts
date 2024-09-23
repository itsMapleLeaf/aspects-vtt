import { partial } from "convex-helpers/validators"
import { v } from "convex/values"
import { Effect } from "effect"
import type { Doc } from "./_generated/dataModel"
import { InaccessibleError, getAuthUserId } from "./auth.ts"
import { effectMutation, effectQuery, queryEnt } from "./lib/effects.ts"
import { tableFields } from "./lib/validators.ts"
import { isRoomOwner } from "./rooms.ts"
import schema from "./schema.ts"

export const list = effectQuery({
	args: {
		roomId: v.id("rooms"),
		search: v.optional(v.string()),
	},
	handler(ctx, { roomId, search }) {
		return Effect.gen(function* () {
			const userId = yield* getAuthUserId(ctx)
			const room = yield* queryEnt(ctx.table("rooms").get(roomId))

			if (!isRoomOwner(room, userId)) {
				return []
			}

			let scenesQuery
			if (search) {
				scenesQuery = ctx
					.table("scenes")
					.search("name", (q) => q.search("name", search).eq("roomId", roomId))
			} else {
				scenesQuery = ctx.table("scenes", "roomId", (q) =>
					q.eq("roomId", roomId),
				)
			}

			const scenes = yield* Effect.promise(() => scenesQuery)
			return scenes.map(normalizeScene)
		}).pipe(Effect.orElseSucceed(() => []))
	},
})

export const get = effectQuery({
	args: {
		sceneId: v.id("scenes"),
	},
	handler(ctx, args) {
		return Effect.gen(function* () {
			const userId = yield* getAuthUserId(ctx)
			const scene = yield* queryEnt(ctx.table("scenes").get(args.sceneId))
			const room = yield* queryEnt(scene.edge("room"))

			if (!isRoomOwner(room, userId)) {
				return null
			}

			return normalizeScene(scene)
		}).pipe(Effect.orElseSucceed(() => null))
	},
})

export const create = effectMutation({
	args: {
		...schema.tables.scenes.validator.fields,
		name: v.optional(v.string()),
		mode: v.optional(v.union(v.literal("scenery"), v.literal("battlemap"))),
		roomId: v.id("rooms"),
		backgroundIds: v.optional(v.array(v.id("_storage"))),
	},
	handler(ctx, args) {
		return Effect.gen(function* () {
			const userId = yield* getAuthUserId(ctx)
			const room = yield* queryEnt(ctx.table("rooms").get(args.roomId))

			if (!isRoomOwner(room, userId)) {
				yield* Effect.fail(
					new InaccessibleError({
						id: args.roomId,
						table: "rooms",
					}),
				)
			}

			const { backgroundIds = [], ...sceneArgs } = args
			return yield* Effect.promise(() =>
				ctx.table("scenes").insert({
					...sceneArgs,
					name: args.name ?? "New Scene",
					mode: args.mode ?? "battlemap",
				}),
			)
		}).pipe(Effect.orDie)
	},
})

export const update = effectMutation({
	args: {
		...partial(tableFields("scenes")),
		sceneId: v.id("scenes"),
	},
	handler(ctx, args) {
		return Effect.gen(function* () {
			const userId = yield* getAuthUserId(ctx)
			const scene = yield* queryEnt(ctx.table("scenes").get(args.sceneId))
			const room = yield* queryEnt(scene.edge("room"))

			if (!isRoomOwner(room, userId)) {
				yield* Effect.fail(
					new InaccessibleError({
						id: room._id,
						table: "rooms",
					}),
				)
			}

			const { sceneId, ...updateArgs } = args
			yield* Effect.promise(() => scene.patch(updateArgs))
		}).pipe(Effect.orDie)
	},
})

export const remove = effectMutation({
	args: {
		sceneIds: v.array(v.id("scenes")),
	},
	handler(ctx, args) {
		return Effect.gen(function* () {
			const userId = yield* getAuthUserId(ctx)
			for (const sceneId of args.sceneIds) {
				const scene = yield* queryEnt(ctx.table("scenes").get(sceneId))
				const room = yield* queryEnt(scene.edge("room"))

				if (!isRoomOwner(room, userId)) {
					yield* Effect.fail(
						new InaccessibleError({
							id: room._id,
							table: "rooms",
						}),
					)
				}
				yield* Effect.promise(() => scene.delete())
			}
		}).pipe(Effect.orDie)
	},
})

export const duplicate = effectMutation({
	args: {
		sceneIds: v.array(v.id("scenes")),
	},
	handler(ctx, args) {
		return Effect.gen(function* () {
			const userId = yield* getAuthUserId(ctx)
			for (const sceneId of args.sceneIds) {
				const scene = yield* queryEnt(ctx.table("scenes").get(sceneId))
				const room = yield* queryEnt(scene.edge("room"))

				if (!isRoomOwner(room, userId)) {
					yield* Effect.fail(
						new InaccessibleError({
							id: room._id,
							table: "rooms",
						}),
					)
				}

				const { _id, _creationTime, ...properties } = scene
				yield* Effect.promise(() =>
					ctx.table("scenes").insert({
						...properties,
						name: `Copy of ${scene.name}`,
					}),
				)
			}
		}).pipe(Effect.orDie)
	},
})

export function normalizeScene(scene: Doc<"scenes">) {
	return {
		...scene,
		mode: scene.mode ?? "battlemap",
		cellSize: scene.cellSize ?? 140,
	}
}
