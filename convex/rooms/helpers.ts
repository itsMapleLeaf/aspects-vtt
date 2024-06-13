import { Effect } from "effect"
import type { Id } from "../_generated/dataModel"
import { getIdentityEffect } from "../auth/helpers.ts"
import { getDoc } from "../helpers/effect.ts"

export class RoomNotOwnedError {
	readonly _tag = "RoomNotOwnedError"
}

export function ensureViewerOwnsRoom(roomId: Id<"rooms">) {
	return Effect.gen(function* () {
		const { identity, room } = yield* Effect.all({
			identity: getIdentityEffect(),
			room: getDoc(roomId),
		})
		if (room.ownerId !== identity.subject) {
			return yield* Effect.fail(new RoomNotOwnedError())
		}
		return room
	})
}
