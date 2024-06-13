import { Effect, pipe } from "effect"
import type { Doc, Id } from "../_generated/dataModel"
import { UnauthorizedError, getUserFromIdentityEffect } from "../auth/helpers.ts"
import { getDoc } from "../helpers/effect.ts"

export function ensureViewerCharacterPermissions(characterId: Id<"characters">) {
	return Effect.gen(function* () {
		const { user, character } = yield* Effect.all({
			user: getUserFromIdentityEffect(),
			character: getDoc(characterId),
		})
		const room = yield* getDoc(character.roomId)
		if (room.ownerId === user.clerkId || character.playerId === user.clerkId) {
			return { user, character, room }
		}
		return yield* Effect.fail(new UnauthorizedError())
	})
}

export class CharactersNotInRoomError {
	readonly _tag = "CharactersNotInRoomError"
	constructor(readonly charactersNotInRoom: Array<Doc<"characters">>) {}
}

export function ensureRoomHasCharacters(
	roomId: Id<"rooms">,
	characterIds: ReadonlyArray<Id<"characters">>,
) {
	return pipe(
		Effect.forEach(characterIds, getDoc, { concurrency: "unbounded" }),
		Effect.flatMap((characters) => {
			const charactersNotInRoom = characters.filter((c) => c.roomId !== roomId)
			return charactersNotInRoom.length === 0 ?
					Effect.succeed(characters)
				:	Effect.fail(new CharactersNotInRoomError(charactersNotInRoom))
		}),
	)
}
