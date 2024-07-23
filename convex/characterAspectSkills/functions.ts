import { getManyFrom } from "convex-helpers/server/relationships"
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
import schema from "../schema.ts"

export const list = effectQuery({
	args: {
		characterId: v.id("characters"),
	},
	handler: (args) => {
		return pipe(
			ensureViewerCharacterPermissions(args.characterId),
			Effect.andThen(() =>
				withQueryCtx((ctx) =>
					getManyFrom(ctx.db, "characterAspectSkills", "characterId", args.characterId),
				),
			),
			Effect.tapError(Effect.logWarning),
			Effect.orElseSucceed(() => []),
		)
	},
})

export const create = effectMutation({
	args: {
		...schema.tables.characterAspectSkills.validator.fields,
	},
	handler: (args) => {
		return pipe(
			ensureViewerCharacterPermissions(args.characterId),
			Effect.andThen(() => withMutationCtx((ctx) => ctx.db.insert("characterAspectSkills", args))),
		)
	},
})

export const remove = effectMutation({
	args: {
		characterAspectSkillId: v.id("characterAspectSkills"),
	},
	handler: (args) => {
		return Effect.gen(function* () {
			const characterAspectSkill = yield* queryDoc((ctx) => ctx.db.get(args.characterAspectSkillId))
			yield* ensureViewerCharacterPermissions(characterAspectSkill.characterId)
			yield* withMutationCtx((ctx) => ctx.db.delete(args.characterAspectSkillId))
		})
	},
})
