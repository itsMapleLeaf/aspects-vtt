import { brandedString } from "convex-helpers/validators"
import { type Infer, v } from "convex/values"
import { omit } from "../../../app/lib/object.ts"
import type { UndefinedToOptional } from "../../../app/lib/types.ts"
import { mutation, query } from "../../_generated/server.js"
import { CharacterModel } from "../../characters/CharacterModel.ts"
import { type Branded, partial, requireDoc } from "../../helpers/convex.ts"
import { RoomModel } from "../../rooms/RoomModel.ts"
import { requireSceneRoomOwner } from "../functions.ts"
import { sceneTokenProperties } from "./types.ts"

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
		...omit(sceneTokenProperties, ["key"]),
		sceneId: v.id("scenes"),
	},
	async handler(ctx, { sceneId, ...args }) {
		const scene = await requireDoc(ctx, sceneId, "scenes").getValueOrThrow()
		await requireSceneRoomOwner(ctx, sceneId).getValueOrThrow()

		if (args.characterId && scene.tokens?.some((token) => token.characterId === args.characterId)) {
			throw new Error("Character already in scene")
		}

		return await ctx.db.patch(sceneId, {
			tokens: [...(scene.tokens ?? []), createToken(args)],
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

export type CreateTokenArgs = UndefinedToOptional<{
	[K in Exclude<keyof typeof sceneTokenProperties, "key">]: Infer<(typeof sceneTokenProperties)[K]>
}>

export function createToken(args: CreateTokenArgs) {
	return { ...args, key: `token:${crypto.randomUUID()}` as Branded<"token"> }
}
