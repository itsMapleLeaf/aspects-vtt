import { v } from "convex/values"
import { Effect, pipe } from "effect"
import { internalMutation, internalQuery } from "./_generated/server.js"
import { Convex, effectQuery } from "./helpers/effect.js"
import { partial } from "./helpers/partial.js"
import schema from "./schema.js"

export const create = internalMutation({
	args: schema.tables.images.validator.fields,
	async handler(ctx, args) {
		return await ctx.db.insert("images", args)
	},
})

export const getBestUrl = effectQuery({
	args: {
		id: v.id("images"),
		width: v.optional(v.number()),
		height: v.optional(v.number()),
	},
	handler(args) {
		return pipe(
			Effect.gen(function* () {
				const image = yield* Convex.db.get(args.id)

				const size = yield* Effect.fromNullable(
					image.sizes
						.toSorted((a, b) => a.width - b.width)
						.find((size) => {
							const biggerWidth = args.width !== undefined && size.width >= args.width
							const biggerHeight = args.height !== undefined && size.height >= args.height
							return biggerWidth && biggerHeight
						}) ?? image.sizes.at(-1),
				)

				return yield* Convex.storage.getUrl(size.storageId)
			}),
			Effect.catchTag("ConvexDocNotFoundError", () => Effect.succeed(null)),
			Effect.tapError(Effect.logError),
			Effect.orElseSucceed(() => null),
		)
	},
})

export const getByHash = internalQuery({
	args: {
		hash: v.string(),
	},
	async handler(ctx, args) {
		return await ctx.db
			.query("images")
			.withIndex("hash", (q) => q.eq("hash", args.hash))
			.first()
	},
})

export const update = internalMutation({
	args: {
		...partial(schema.tables.images.validator.fields),
		id: v.id("images"),
	},
	async handler(ctx, { id, ...args }) {
		await ctx.db.patch(id, args)
	},
})
