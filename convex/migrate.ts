import { makeMigration, startMigrationsSerially } from "convex-helpers/server/migrations"
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
		if (character.imageId) {
			const createdImage = character.image && (await ctx.db.get(character.image))
			if (createdImage) return
			await ctx.scheduler.runAfter(0, internal.images_node.setCharacterImageFromStorage, {
				storageId: character.imageId,
				characterId: character._id,
			})
		}
	},
})
