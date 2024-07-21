import { Data, Effect, pipe } from "effect"
import { Doc, Id } from "../_generated/dataModel"
import { getAuthUserId } from "./auth.ts"
import { getDoc, getFirstDoc, queryIndex } from "./db.ts"

export class RoomNotOwnedError extends Data.TaggedError("RoomNotOwnedError") {}

export function getRoomBySlug(slug: string) {
	return pipe(
		queryIndex("rooms", "slug", ["slug", slug]),
		Effect.flatMap(getFirstDoc),
	)
}

export function normalizeRoom(room: Doc<"rooms">) {
	return pipe(
		getAuthUserId(),
		Effect.map((userId) => ({
			...room,
			isOwner: room.owner === userId,
		})),
	)
}

export function ensureRoomOwner(id: Id<"rooms">) {
	return pipe(
		getDoc(id),
		Effect.flatMap(normalizeRoom),
		Effect.filterOrFail(
			(room) => room.isOwner,
			() => new RoomNotOwnedError(),
		),
	)
}
