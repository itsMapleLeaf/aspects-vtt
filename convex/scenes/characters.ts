import { partial } from "convex-helpers/validators"
import { v } from "convex/values"
import { pick } from "#app/common/object.js"
import { CharacterModel } from "#convex/CharacterModel.ts"
import { RoomModel } from "#convex/RoomModel.ts"
import { mutation, query } from "#convex/_generated/server.js"
import { requireDoc } from "../helpers.ts"
import { requireSceneRoomOwner } from "../scenes.ts"

const sceneCharacterUpdateProperties = {
	position: v.object({ x: v.number(), y: v.number() }),
	visible: v.boolean(),
}

export const sceneCharacterProperties = {
	...sceneCharacterUpdateProperties,
	characterId: v.id("characters"),
}

export const list = query({
	args: {
		sceneId: v.id("scenes"),
	},
	async handler(ctx, args) {
		const scene = await requireDoc(ctx, args.sceneId, "scenes").getValueOrThrow()

		const room = await RoomModel.fromId(ctx, scene.roomId).getValueOrNull()
		if (!room) {
			console.warn(
				`Attempt to list character tokens from scene ${args.sceneId} with nonexistent room`,
			)
			return []
		}

		const characters = (
			await Promise.all(
				scene.characterTokens.map(async (token) => {
					const model = await CharacterModel.get(ctx, token.characterId).getValueOrNull()
					return {
						token,
						character: await model?.getComputedData(),
					}
				}),
			)
		).flatMap((it) => (it.character ? [{ ...it, character: it.character }] : []))

		if (await room.isOwner()) {
			return characters
		}

		return characters.filter((character) => character.token.visible)
	},
})

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
