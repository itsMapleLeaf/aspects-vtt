import { Effect } from "effect"
import type { Id } from "../_generated/dataModel"
import {
	UnauthorizedError,
	getUserFromIdentityEffect,
} from "../auth/helpers.ts"
import { queryDoc } from "../helpers/effect.ts"

export function ensureViewerCharacterPermissions(
	characterId: Id<"characters">,
) {
	return Effect.gen(function* () {
		const { user, character } = yield* Effect.all({
			user: getUserFromIdentityEffect(),
			character: queryDoc((ctx) =>
				ctx.table("characters").get(characterId).doc(),
			),
		})
		const room = yield* queryDoc((ctx) =>
			ctx.table("rooms").get(character.roomId).doc(),
		)
		if (room.ownerId === user.clerkId || character.playerId === user.clerkId) {
			return { user, character, room }
		}
		return yield* Effect.fail(new UnauthorizedError())
	})
}
