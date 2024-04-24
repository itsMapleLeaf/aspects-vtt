import { brandedString } from "convex-helpers/validators"
import { v } from "convex/values"
import { omit } from "#app/common/object.js"
import { CharacterModel } from "#convex/CharacterModel.ts"
import { RoomModel } from "#convex/RoomModel.ts"
import { mutation, query } from "#convex/_generated/server.js"
import { type Branded, partial, requireDoc } from "../helpers.ts"
import { requireSceneRoomOwner } from "../scenes.ts"

export const sceneTokenProperties = {
	key: brandedString("token"),
	position: v.object({ x: v.number(), y: v.number() }),
	visible: v.boolean(),
	characterId: v.optional(v.id("characters")),
}

export type ApiToken = Awaited<ReturnType<typeof list>>[number]

export const list = query({
	args: {
		sceneId: v.id("scenes"),
	},
	async handler(ctx, args) {
		const scene = await requireDoc(ctx, args.sceneId, "scenes").getValueOrThrow()

		const room = await RoomModel.fromId(ctx, scene.roomId).getValueOrNull()
		if (!room) {
			console.warn(`Attempt to list tokens from scene ${args.sceneId} with nonexistent room`)
			return []
		}

		const tokens = await Promise.all(
			scene.tokens?.map(async (token) => {
				const character =
					token.characterId && (await CharacterModel.get(ctx, token.characterId).getValueOrNull())
				return {
					...token,
					character: await character?.getComputedData(),
				}
			}) ?? [],
		)

		if (await room.isOwner()) {
			return tokens
		}

		return tokens.filter((token) => token.visible)
	},
})

export const add = mutation({
	args: {
		...omit(sceneTokenProperties, ["key", "visible"]),
		sceneId: v.id("scenes"),
	},
	async handler(ctx, { sceneId, ...args }) {
		const scene = await requireDoc(ctx, sceneId, "scenes").getValueOrThrow()
		await requireSceneRoomOwner(ctx, sceneId).getValueOrThrow()

		if (args.characterId && scene.tokens?.some((token) => token.characterId === args.characterId)) {
			throw new Error("Character already in scene")
		}

		return await ctx.db.patch(sceneId, {
			tokens: [
				...(scene.tokens ?? []),
				{ ...args, key: crypto.randomUUID() as Branded<"token">, visible: false },
			],
		})
	},
})

export const remove = mutation({
	args: {
		sceneId: v.id("scenes"),
		tokenKey: brandedString("token"),
	},
	async handler(ctx, { sceneId, tokenKey }) {
		const scene = await requireDoc(ctx, sceneId, "scenes").getValueOrThrow()
		await requireSceneRoomOwner(ctx, sceneId).getValueOrThrow()

		return await ctx.db.patch(sceneId, {
			tokens: scene.tokens?.filter((token) => token.key !== tokenKey),
		})
	},
})

export const update = mutation({
	args: {
		...partial(sceneTokenProperties),
		sceneId: v.id("scenes"),
		key: brandedString("token"),
	},
	async handler(ctx, { sceneId, key, ...args }) {
		const scene = await requireDoc(ctx, sceneId, "scenes").getValueOrThrow()
		await requireSceneRoomOwner(ctx, sceneId).getValueOrThrow()

		return await ctx.db.patch(sceneId, {
			tokens: scene.tokens?.map((token) => (token.key === key ? { ...token, ...args } : token)),
		})
	},
})
