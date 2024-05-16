import { Effect, pipe } from "effect"
import type { Id } from "../_generated/dataModel"
import { UnauthorizedError, getUserFromIdentityEffect } from "../auth/helpers.ts"
import { queryDoc } from "../helpers/effect.ts"

export function ensureViewerOwnsCharacter(characterId: Id<"characters">) {
	return pipe(
		Effect.all({
			user: getUserFromIdentityEffect(),
			character: queryDoc((ctx) => ctx.table("characters").get(characterId).doc()),
		}),
		Effect.filterOrFail(
			({ user, character }) => user.clerkId === character.playerId,
			() => new UnauthorizedError(),
		),
	)
}
