import { createAccount } from "@convex-dev/auth/server"
import { v } from "convex/values"
import { internal } from "./_generated/api.js"
import type { Id, TableNames } from "./_generated/dataModel"
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
				name: "maple",
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

		const scenes = {
			rosenfeld: await ctx.db.insert("scenes", {
				name: "Rosenfeld",
				roomId,
				mode: "battlemap",
				battlemapBackgroundId:
					"kg24dnnr4n8fhqrcmr6k3ermhx70jscv" as Id<"_storage">,
			}),
			outerRosenfeld: await ctx.db.insert("scenes", {
				name: "Outer Rosenfeld",
				roomId,
				mode: "battlemap",
				battlemapBackgroundId:
					"kg2bkprs36d0axyh0baz0g9rd970jkhx" as Id<"_storage">,
			}),
		}

		await ctx.db.patch(roomId, {
			activeSceneId: scenes.rosenfeld,
		})

		await ctx.db.insert("characters", {
			name: "Luna",
			updatedAt: Date.now(),
			roomId,
			ownerId: args.userId,
			imageId: "kg2f4vvcqt3dax3mvjf2h0g6vh70kjvk" as Id<"_storage">,
		})

		await ctx.db.insert("characters", {
			name: "Priya",
			updatedAt: Date.now(),
			roomId,
			sceneId: scenes.rosenfeld,
			ownerId: args.userId,
			imageId: "kg22rmepz9vqrv5h1377h4ykbn70js8k" as Id<"_storage">,
		})
	},
})
