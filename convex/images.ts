import { DocNotFound, FileNotFound } from "@maple/convex-effect"
import { v } from "convex/values"
import { Effect, pipe } from "effect"
import { internalMutation, internalQuery, query } from "./api.ts"
import { Convex, effectQuery } from "./helpers/effect.js"
import { partial } from "./helpers/partial.js"
import schema from "./schema.js"

export const create = internalMutation({
	args: schema.tables.images.validator.fields,
	handler(ctx, args) {
		return ctx.db.insert("images", args)
	},
})

export const getBestUrl = query({
	args: {
		id: v.id("images"),
		width: v.optional(v.number()),
		height: v.optional(v.number()),
	},
	handler(ctx, args) {
		return pipe(
			ctx.db.get(args.id),
			Effect.flatMap((image) => {
				const size = image.sizes
					.toSorted((a, b) => a.width - b.width)
					.find((size) => {
						const biggerWidth = args.width !== undefined && size.width >= args.width
						const biggerHeight = args.height !== undefined && size.height >= args.height
						return biggerWidth && biggerHeight
					})
				return Effect.fromNullable(size ?? image.sizes.at(-1))
			}),
			Effect.flatMap((size) => ctx.storage.getUrl(size.storageId)),
			Effect.catchTags({
				DocNotFound: () => Effect.succeed(null),
				FileNotFound: () => Effect.succeed(null),
				NoSuchElementException: () => Effect.dieMessage("Image has no sizes"),
			}),
		)
	},
})

export const getByHash = internalQuery({
	args: {
		hash: v.string(),
	},
	handler(ctx, args) {
		return ctx.db
			.query("images")
			.withIndex("hash", (q) => q.eq("hash", args.hash))
			.firstOrNull()
	},
})

export const update = internalMutation({
	args: {
		...partial(schema.tables.images.validator.fields),
		id: v.id("images"),
	},
	handler(ctx, { id, ...args }) {
		return ctx.db.patch(id, args)
	},
})
