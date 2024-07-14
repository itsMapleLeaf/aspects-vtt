import { v } from "convex/values"
import { internalMutation, internalQuery } from "./_generated/server.js"
import { partial } from "./helpers/partial.js"
import schema from "./schema.js"

export const create = internalMutation({
	args: schema.tables.images.validator.fields,
	async handler(ctx, args) {
		return await ctx.db.insert("images", args)
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
