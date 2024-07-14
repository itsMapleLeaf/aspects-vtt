import { Effect } from "effect"
import type { Id } from "../_generated/dataModel"
import { Convex } from "../helpers/effect.ts"
import { getCurrentUser } from "../users.ts"

export class RoomNotOwnedError {
	readonly _tag = "RoomNotOwnedError"
}

export function ensureViewerOwnsRoom(roomId: Id<"rooms">) {
	return Effect.gen(function* () {
		const { viewer, room } = yield* Effect.all({
			viewer: getCurrentUser(),
			room: Convex.db.get(roomId),
		})
		if (room.owner === viewer._id) {
			return room
		}
		return yield* Effect.fail(new RoomNotOwnedError())
	})
}
