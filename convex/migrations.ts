import { internalMutation } from "./_generated/server"

export const migrate = internalMutation(async (ctx) => {
	for await (const character of ctx.db.query("characters")) {
		if (character.tokenPosition) {
			await ctx.db.patch(character._id, {
				token: {
					position: character.tokenPosition ?? { x: 0, y: 0 },
					visible: character.visible ?? false,
				},
				tokenPosition: undefined,
			})
			console.log("Migrated character", character._id, character.tokenPosition)
		}
	}
})
