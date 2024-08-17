import {
	makeMigration,
	startMigrationsSerially,
} from "convex-helpers/server/migrations"
import { internal } from "./_generated/api.js"
import { internalMutation } from "./_generated/server.js"

const migration = makeMigration(internalMutation, {
	migrationTable: "migrations",
})

export default internalMutation(async (ctx) => {
	await startMigrationsSerially(ctx, [
		internal.migrate.characterImages,
		internal.migrate.items,
	])
})

export const characterImages = migration({
	table: "characters",
	async migrateOne(ctx, character) {
		const imageId =
			character.imageId && ctx.db.normalizeId("images", character.imageId)
		const createdImage = imageId && (await ctx.db.get(imageId))
		if (character.imageId && !createdImage) {
			await ctx.scheduler.runAfter(
				0,
				internal.images_node.setCharacterImageFromStorage,
				{
					storageId: character.imageId,
					characterId: character._id,
				},
			)
		}
	},
})

export const items = migration({
	table: "characters",
	async migrateOne(ctx, character) {
		for await (const existing of ctx.db
			.query("characterItems")
			.withIndex("characterId", (q) => q.eq("characterId", character._id))) {
			await ctx.db.delete(existing._id)
		}

		for (const item of character.inventory ?? []) {
			const existingItem = await ctx.db
				.query("items")
				.filter((q) => q.eq(q.field("name"), item.name))
				.first()

			const existingItemId =
				existingItem?._id ??
				(await ctx.db.insert("items", {
					name: item.name,
					description: "",
					roomId: character.roomId,
				}))

			const existingCharacterItem = await ctx.db
				.query("characterItems")
				.withIndex("characterId_itemId", (q) =>
					q.eq("characterId", character._id).eq("itemId", existingItemId),
				)
				.first()

			if (!existingCharacterItem) {
				await ctx.db.insert("characterItems", {
					characterId: character._id,
					itemId: existingItemId,
					quantity: 1,
				})
			} else {
				await ctx.db.patch(existingCharacterItem._id, {
					quantity: existingCharacterItem.quantity + 1,
				})
			}
		}
	},
})
