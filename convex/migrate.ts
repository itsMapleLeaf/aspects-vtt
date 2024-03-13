import { mutation } from "./_generated/server"

export const migrate = mutation(async (ctx) => {
	for await (const token of ctx.db.query("mapTokens")) {
		await ctx.db.patch(token._id, {
			fields: [
				{ key: "name", value: token.name ?? "" },
				{ key: "health", value: token.health ?? 8 },
				{ key: "health:max", value: token.maxHealth ?? 8 },
				{ key: "fatigue", value: token.fatigue ?? 0 },
			],
			name: undefined,
			health: undefined,
			maxHealth: undefined,
			fatigue: undefined,
		})
	}
})
