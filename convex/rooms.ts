import { ConvexError, v } from "convex/values"
import { Effect } from "effect"
import type { Doc, Id } from "./_generated/dataModel"
import { getAuthUserId, InaccessibleError } from "./lib/auth.ts"
import { queryEntOrFail, runConvexEffect } from "./lib/effects.ts"
import { mutation, query } from "./lib/ents.ts"
import { nullish } from "./lib/validators.ts"

export const list = query({
	async handler(ctx) {
		return runConvexEffect(
			Effect.gen(function* () {
				const userId = yield* getAuthUserId(ctx)
				return yield* queryEntOrFail(() =>
					ctx.table("rooms", "ownerId", (q) => q.eq("ownerId", userId)),
				)
			}).pipe(Effect.orElseSucceed(() => [])),
		)
	},
})

export const get = query({
	args: {
		id: v.string(),
	},
	async handler(ctx, args) {
		return runConvexEffect(
			Effect.gen(function* () {
				const id = ctx.table("rooms").normalizeId(args.id)

				const room =
					id ?
						yield* queryEntOrFail(() => ctx.table("rooms").get(id))
					:	yield* queryEntOrFail(() => ctx.table("rooms").get("slug", args.id))

				return room.doc()
			}).pipe(Effect.orElseSucceed(() => null)),
		)
	},
})

export const create = mutation({
	args: {
		name: v.string(),
		slug: v.string(),
	},
	async handler(ctx, args) {
		return runConvexEffect(
			Effect.gen(function* () {
				const userId = yield* getAuthUserId(ctx)
				const existing = yield* Effect.promise(() =>
					ctx.table("rooms", "ownerId", (q) => q.eq("ownerId", userId)),
				)

				if (existing != null) {
					yield* Effect.fail(
						() => new ConvexError(`The slug "${args.slug}" is already taken`),
					)
				}

				yield* Effect.promise(() =>
					ctx.table("rooms").insert({ ...args, ownerId: userId }),
				)
			}),
		)
	},
})

export const update = mutation({
	args: {
		id: v.id("rooms"),
		activeSceneId: nullish(v.id("scenes")),
	},
	handler: async (ctx, args) => {
		return runConvexEffect(
			Effect.gen(function* () {
				const userId = yield* getAuthUserId(ctx)
				const room = yield* queryEntOrFail(() =>
					ctx.table("rooms").get(args.id),
				)

				if (!isRoomOwner(room, userId)) {
					yield* Effect.fail(
						() =>
							new ConvexError(`You don't have permission to update this room`),
					)
				}

				const { id, ...updateArgs } = args
				yield* Effect.promise(() => room.patch(updateArgs))
			}),
		)
	},
})

export const remove = mutation({
	args: {
		id: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		return runConvexEffect(
			Effect.gen(function* () {
				const userId = yield* getAuthUserId(ctx)
				const room = yield* queryEntOrFail(() =>
					ctx.table("rooms").get(args.id),
				)

				if (!isRoomOwner(room, userId)) {
					yield* Effect.fail(
						() => new InaccessibleError({ id: args.id, collection: "rooms" }),
					)
				}

				yield* Effect.promise(() => room.delete())
			}),
		)
	},
})

export function isRoomOwner(room: Doc<"rooms">, userId: Id<"users">) {
	return room.ownerId === userId
}
