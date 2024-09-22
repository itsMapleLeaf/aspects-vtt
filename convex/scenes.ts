import { partial } from "convex-helpers/validators"
import { v } from "convex/values"
import { Effect } from "effect"
import type { Doc } from "./_generated/dataModel"
import { InaccessibleError, getAuthUserId } from "./lib/auth.ts"
import { queryEntOrFail, runConvexEffect } from "./lib/effects.ts"
import { mutation, query } from "./lib/ents.ts"
import { tableFields } from "./lib/validators.ts"
import { isRoomOwner } from "./rooms.ts"
import schema from "./schema.ts"

export const list = query({
	args: {
		roomId: v.id("rooms"),
		search: v.optional(v.string()),
	},
	async handler(ctx, { roomId, search }) {
		return runConvexEffect(
			Effect.gen(function* () {
				const userId = yield* getAuthUserId(ctx)
				const room = yield* queryEntOrFail(() => ctx.table("rooms").get(roomId))

				if (!isRoomOwner(room, userId)) {
					return []
				}

				let scenesQuery
				if (search) {
					scenesQuery = ctx
						.table("scenes")
						.search("name", (q) =>
							q.search("name", search).eq("roomId", roomId),
						)
				} else {
					scenesQuery = ctx.table("scenes", "roomId", (q) =>
						q.eq("roomId", roomId),
					)
				}

				const scenes = yield* Effect.promise(() => scenesQuery)
				return scenes.map(normalizeScene)
			}).pipe(Effect.orElseSucceed(() => [])),
		)
	},
})

export const get = query({
	args: {
		sceneId: v.id("scenes"),
	},
	async handler(ctx, args) {
		return runConvexEffect(
			Effect.gen(function* () {
				const userId = yield* getAuthUserId(ctx)
				const scene = yield* queryEntOrFail(() =>
					ctx.table("scenes").get(args.sceneId),
				)
				const room = yield* queryEntOrFail(() => scene.edge("room"))

				if (!isRoomOwner(room, userId)) {
					return null
				}

				return normalizeScene(scene)
			}).pipe(Effect.orElseSucceed(() => null)),
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
	async handler(ctx, args) {
		return runConvexEffect(
			Effect.gen(function* () {
				const userId = yield* getAuthUserId(ctx)
				const room = yield* queryEntOrFail(() =>
					ctx.table("rooms").get(args.roomId),
				)

				if (!isRoomOwner(room, userId)) {
					yield* Effect.fail(
						() =>
							new InaccessibleError({
								id: args.roomId,
								collection: "rooms",
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
			}),
		)
	},
})

export const update = mutation({
	args: {
		...partial(tableFields("scenes")),
		sceneId: v.id("scenes"),
	},
	async handler(ctx, args) {
		return runConvexEffect(
			Effect.gen(function* () {
				const userId = yield* getAuthUserId(ctx)
				const scene = yield* queryEntOrFail(() =>
					ctx.table("scenes").get(args.sceneId),
				)
				const room = yield* queryEntOrFail(() => scene.edge("room"))

				if (!isRoomOwner(room, userId)) {
					yield* Effect.fail(
						() =>
							new InaccessibleError({
								id: room._id,
								collection: "rooms",
							}),
					)
				}

				const { sceneId, ...updateArgs } = args
				yield* Effect.promise(() => scene.patch(updateArgs))
			}),
		)
	},
})

export const remove = mutation({
	args: {
		sceneIds: v.array(v.id("scenes")),
	},
	async handler(ctx, args) {
		return runConvexEffect(
			Effect.gen(function* () {
				const userId = yield* getAuthUserId(ctx)
				for (const sceneId of args.sceneIds) {
					const scene = yield* queryEntOrFail(() =>
						ctx.table("scenes").get(sceneId),
					)
					const room = yield* queryEntOrFail(() => scene.edge("room"))

					if (!isRoomOwner(room, userId)) {
						yield* Effect.fail(
							() =>
								new InaccessibleError({
									id: room._id,
									collection: "rooms",
								}),
						)
					}
					yield* Effect.promise(() => scene.delete())
				}
			}),
		)
	},
})

export const duplicate = mutation({
	args: {
		sceneIds: v.array(v.id("scenes")),
	},
	async handler(ctx, args) {
		return runConvexEffect(
			Effect.gen(function* () {
				const userId = yield* getAuthUserId(ctx)
				for (const sceneId of args.sceneIds) {
					const scene = yield* queryEntOrFail(() =>
						ctx.table("scenes").get(sceneId),
					)
					const room = yield* queryEntOrFail(() => scene.edge("room"))

					if (!isRoomOwner(room, userId)) {
						yield* Effect.fail(
							() =>
								new InaccessibleError({
									id: room._id,
									collection: "rooms",
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
			}),
		)
	},
})

export function normalizeScene(scene: Doc<"scenes">) {
	return {
		...scene,
		mode: scene.mode ?? "battlemap",
		cellSize: scene.cellSize ?? 140,
	}
}
