import { brandedString } from "convex-helpers/validators"
import { type Infer, v } from "convex/values"
import { Console, Effect } from "effect"
import { omit } from "../../../app/helpers/object.ts"
import { typed, type UndefinedToOptional } from "../../../app/helpers/types.ts"
import { mutation } from "../../_generated/server.js"
import { normalizeCharacter, protectCharacter } from "../../characters/helpers.ts"
import { type Branded, requireDoc } from "../../helpers/convex.ts"
import { effectQuery, getDoc } from "../../helpers/effect.ts"
import { partial } from "../../helpers/partial.ts"
import { isRoomOwner } from "../../rooms/functions.ts"
import { requireSceneRoomOwnerOld } from "../functions.ts"
import { sceneTokenProperties } from "./types.ts"

export type ApiToken = Awaited<ReturnType<typeof list>>[number]

export const list = effectQuery({
	args: {
		sceneId: v.id("scenes"),
	},
	handler(args) {
		return Effect.gen(function* () {
			const scene = yield* getDoc(args.sceneId)
			const isOwner = yield* isRoomOwner(scene.roomId)

			const visibleTokens = isOwner ? scene.tokens : scene.tokens?.filter((token) => token.visible)

			const tokens = yield* Effect.forEach(visibleTokens ?? [], (token) =>
				Effect.fromNullable(token.characterId).pipe(
					Effect.flatMap(getDoc),
					Effect.map(normalizeCharacter),
					// for our purposes here, every token is visible
					Effect.flatMap((it) => protectCharacter({ ...it, visible: typed<boolean>(true) })),
					Effect.orElseSucceed(() => null),
					Effect.map((character) => ({ ...token, character })),
				),
			)

			return tokens.filter((it) => it.area || it.character)
		}).pipe(
			Effect.tapError(Console.warn),
			Effect.orElseSucceed(() => []),
			Effect.map((value) => [...value]), // get rid of the never[] type
		)
	},
})

export const add = mutation({
	args: {
		...omit(sceneTokenProperties, ["key"]),
		sceneId: v.id("scenes"),
	},
	async handler(ctx, { sceneId, ...args }) {
		const scene = await requireDoc(ctx, sceneId, "scenes").getValueOrThrow()
		await requireSceneRoomOwnerOld(ctx, sceneId).getValueOrThrow()

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
		await requireSceneRoomOwnerOld(ctx, sceneId).getValueOrThrow()

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
		await requireSceneRoomOwnerOld(ctx, sceneId).getValueOrThrow()

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
