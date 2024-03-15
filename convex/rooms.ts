import { v } from "convex/values"
import { generateSlug } from "random-word-slugs"
import { type QueryCtx, mutation, query } from "./_generated/server.js"

export const get = query({
	args: { slug: v.string() },
	handler: async (ctx, args) => {
		return await getRoomBySlug(ctx, args)
	},
})

export const create = mutation({
	handler: async (ctx, args) => {
		const slug = await generateUniqueSlug(ctx)
		if (!slug) {
			console.error("Failed to create unique slug")
			return { error: "Something went wrong, try again." }
		}

		await ctx.db.insert("rooms", { name: slug, slug })
		return { slug }
	},
})

export const update = mutation({
	args: {
		id: v.id("rooms"),
		name: v.optional(v.string()),
		mapImageId: v.optional(v.id("images")),
	},
	handler: async (ctx, { id, ...args }) => {
		return await ctx.db.patch(id, args)
	},
})

export const remove = mutation({
	args: { id: v.id("rooms") },
	handler: async (ctx, args) => {
		return await ctx.db.delete(args.id)
	},
})

async function getRoomBySlug(ctx: QueryCtx, args: { slug: string }) {
	return await ctx.db
		.query("rooms")
		.withIndex("by_slug", (q) => q.eq("slug", args.slug))
		.unique()
}

async function generateUniqueSlug(ctx: QueryCtx): Promise<string | undefined> {
	let slug
	let attempts = 0
	do {
		slug = generateSlug()
		attempts++
	} while ((await getRoomBySlug(ctx, { slug })) == null && attempts < 10)
	return slug
}
