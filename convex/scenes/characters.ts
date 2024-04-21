import { partial } from "convex-helpers/validators"
import { v } from "convex/values"
import { pick } from "#app/common/object.js"
import { mutation } from "#convex/_generated/server.js"
import { requireDoc } from "#convex/helpers.js"
import { requireSceneRoomOwner } from "../scenes.ts"

const sceneCharacterUpdateProperties = {
	position: v.object({ x: v.number(), y: v.number() }),
	visible: v.boolean(),
}

export const sceneCharacterProperties = {
	...sceneCharacterUpdateProperties,
	characterId: v.id("characters"),
}

export const add = mutation({
	args: {
		...pick(sceneCharacterProperties, ["characterId", "position"]),
		sceneId: v.id("scenes"),
	},
	async handler(ctx, { sceneId, characterId, position }) {
		const scene = await requireDoc(ctx, sceneId, "scenes").getValueOrThrow()
		await requireSceneRoomOwner(ctx, sceneId).getValueOrThrow()

		if (scene.characterTokens.some((token) => token.characterId === characterId)) {
			throw new Error("Character already in scene")
		}

		return await ctx.db.patch(sceneId, {
			characterTokens: [...scene.characterTokens, { characterId, position, visible: true }],
		})
	},
})

export const remove = mutation({
	args: {
		...pick(sceneCharacterProperties, ["characterId"]),
		sceneId: v.id("scenes"),
	},
	async handler(ctx, { sceneId, characterId }) {
		const scene = await requireDoc(ctx, sceneId, "scenes").getValueOrThrow()
		await requireSceneRoomOwner(ctx, sceneId).getValueOrThrow()

		if (!scene.characterTokens.some((token) => token.characterId === characterId)) {
			throw new Error("Character not in scene")
		}

		return await ctx.db.patch(sceneId, {
			characterTokens: scene.characterTokens.filter((token) => token.characterId !== characterId),
		})
	},
})

export const update = mutation({
	args: {
		...partial(sceneCharacterUpdateProperties),
		sceneId: v.id("scenes"),
		characterId: v.id("characters"),
	},
	async handler(ctx, { sceneId, characterId, ...args }) {
		const scene = await requireDoc(ctx, sceneId, "scenes").getValueOrThrow()
		await requireSceneRoomOwner(ctx, sceneId).getValueOrThrow()

		if (!scene.characterTokens.some((token) => token.characterId === characterId)) {
			throw new Error("Character not in scene")
		}

		return await ctx.db.patch(sceneId, {
			characterTokens: scene.characterTokens.map((token) =>
				token.characterId === characterId ? { ...token, ...args } : token,
			),
		})
	},
})
