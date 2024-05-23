import { v } from "convex/values"
import { Effect, pipe } from "effect"
import { ensureViewerCharacterPermissions } from "../characters/helpers.ts"
import {
	effectMutation,
	effectQuery,
	queryDoc,
	withMutationCtx,
	withQueryCtx,
} from "../helpers/effect.ts"
import { characterAspectSkillProperties } from "./types.ts"

export const list = effectQuery({
	args: {
		characterId: v.id("characters"),
	},
	handler: (args) => {
		return pipe(
			ensureViewerCharacterPermissions(args.characterId),
			Effect.andThen(() =>
				withQueryCtx((ctx) =>
					ctx.table("characters").getX(args.characterId).edge("characterAspectSkills").docs(),
				),
			),
			Effect.tapError(Effect.logWarning),
			Effect.orElseSucceed(() => []),
		)
	},
})

export const create = effectMutation({
	args: {
		...characterAspectSkillProperties,
	},
	handler: (args) => {
		return pipe(
			ensureViewerCharacterPermissions(args.characterId),
			Effect.andThen(() =>
				withMutationCtx((ctx) => ctx.table("characterAspectSkills").insert(args)),
			),
		)
	},
})

export const remove = effectMutation({
	args: {
		characterAspectSkillId: v.id("characterAspectSkills"),
	},
	handler: (args) => {
		return Effect.gen(function* () {
			const characterAspectSkill = yield* queryDoc((ctx) =>
				ctx.table("characterAspectSkills").get(args.characterAspectSkillId).doc(),
			)
			yield* ensureViewerCharacterPermissions(characterAspectSkill.characterId)
			yield* withMutationCtx((ctx) =>
				ctx.table("characterAspectSkills").getX(args.characterAspectSkillId).delete(),
			)
		})
	},
})
