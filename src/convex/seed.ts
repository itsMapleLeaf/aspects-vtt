import { createAccount } from "@convex-dev/auth/server"
import { v } from "convex/values"
import { internal } from "./_generated/api.js"
import type { TableNames } from "./_generated/dataModel"
import { internalAction, internalMutation } from "./_generated/server.js"
import schema from "./schema.ts"

export default internalAction({
	async handler(ctx) {
		if (process.env.NODE_ENV === "production") {
			throw new Error("Seeding is not allowed in production")
		}

		await ctx.runMutation(internal.seed.resetDatabase)

		const { user } = await createAccount(ctx, {
			provider: "credentials",
			account: {
				id: "maple",
				secret: "maple",
			},
			profile: {
				name: "Maple",
				handle: "maple",
			},
		})

		await ctx.runMutation(internal.seed.createDocuments, {
			userId: user._id,
		})
	},
})

export const resetDatabase = internalMutation({
	async handler(ctx) {
		for (const tableName in schema.tables) {
			for await (const doc of ctx.db.query(tableName as TableNames)) {
				await ctx.db.delete(doc._id)
			}
		}
	},
})

export const createDocuments = internalMutation({
	args: v.object({
		userId: v.id("users"),
	}),
	async handler(ctx, args) {
		const roomId = await ctx.db.insert("rooms", {
			name: "Rosenfeld",
			slug: "rosenfeld",
			ownerId: args.userId,
		})
	},
})
