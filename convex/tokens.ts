import { partial } from "convex-helpers/validators"
import { v } from "convex/values"
import { Effect } from "effect"
import { defaults } from "lodash-es"
import { getAuthUserId } from "~/convex/auth.ts"
import {
	ensureCharacterEntAdmin,
	normalizeCharacter,
	protectCharacter,
} from "~/convex/characters.ts"
import { effectMutation, effectQuery, queryEnt } from "~/convex/lib/effects.ts"
import { tableFields } from "./lib/validators.ts"
import { queryViewerOwnedRoom } from "./rooms.ts"

export const list = effectQuery({
	args: {
		sceneId: v.id("scenes"),
	},
	handler(ctx, args) {
		return Effect.gen(function* () {
			const userId = yield* getAuthUserId(ctx)
			const scene = yield* queryEnt(ctx.table("scenes").get(args.sceneId))
			const room = yield* queryEnt(scene.edge("room"))

			return yield* Effect.promise(() =>
				scene
					.edge("characterTokens")
					.map(async (token) => {
						const character = protectCharacter(
							normalizeCharacter(await token.edge("character")),
							userId,
							room,
						)

						if (character == null) {
							return null
						}

						return {
							...defaults(token.doc(), {
								position: { x: 0, y: 0 },
								visible: false,
								updatedAt: 0,
							}),
							character,
						}
					})
					.filter((result) => result != null),
			)
		}).pipe(Effect.orElseSucceed(() => []))
	},
})

export const get = effectQuery({
	args: {
		characterId: v.id("characters"),
		sceneId: v.id("scenes"),
	},
	handler(ctx, args) {
		return Effect.gen(function* () {
			return yield* queryEnt(
				ctx
					.table("characterTokens")
					.get("characterId_sceneId", args.characterId, args.sceneId),
			)
		}).pipe(Effect.orElseSucceed(() => null))
	},
})

export const create = effectMutation({
	args: {
		inputs: v.array(
			v.object({
				sceneId: v.id("scenes"),
				characterId: v.id("characters"),
				position: v.optional(v.object({ x: v.number(), y: v.number() })),
				visible: v.optional(v.boolean()),
			}),
		),
	},
	handler(ctx, { inputs }) {
		return Effect.gen(function* () {
			for (const args of inputs) {
				const scene = yield* queryEnt(ctx.table("scenes").get(args.sceneId))
				yield* queryViewerOwnedRoom(scene.edge("room"))

				yield* Effect.promise(() =>
					ctx.table("characterTokens").insert({
						...args,
						updatedAt: Date.now(),
					}),
				)
			}
		}).pipe(Effect.orDie)
	},
})

export const update = effectMutation({
	args: {
		updates: v.array(
			v.object({
				...partial(tableFields("characterTokens")),
				tokenId: v.id("characterTokens"),
			}),
		),
	},
	handler(ctx, { updates }) {
		return Effect.gen(function* () {
			for (const { tokenId, ...props } of updates) {
				const token = yield* queryEnt(ctx.table("characterTokens").get(tokenId))
				const character = yield* queryEnt(token.edge("character"))
				yield* ensureCharacterEntAdmin(ctx, character)
				yield* Effect.promise(() => token.patch(props))
			}
		}).pipe(Effect.orDie)
	},
})

export const remove = effectMutation({
	args: {
		tokenIds: v.array(v.id("characterTokens")),
	},
	handler(ctx, args) {
		return Effect.gen(function* () {
			for (const tokenId of args.tokenIds) {
				const token = yield* queryEnt(ctx.table("characterTokens").get(tokenId))
				const character = yield* queryEnt(token.edge("character"))
				yield* ensureCharacterEntAdmin(ctx, character)
				yield* Effect.promise(() => token.delete())
			}
		}).pipe(Effect.orDie)
	},
})
