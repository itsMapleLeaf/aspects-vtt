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
	await startMigrationsSerially(ctx, [internal.migrate.characterImages])
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
