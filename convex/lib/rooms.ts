import { Effect, pipe } from "effect"
import { Doc, Id } from "../_generated/dataModel"
import { getDoc, getFirstDoc, queryIndex } from "./db.ts"

export function getRoom(input: { id: Id<"rooms"> } | { slug: string }) {
	return Effect.gen(function* () {
		let room: Doc<"rooms">
		if ("id" in input) {
			room = yield* getDoc(input.id)
		} else {
			room = yield* pipe(
				queryIndex("rooms", "slug", ["slug", input.slug]),
				Effect.flatMap(getFirstDoc),
			)
		}
		return room
	})
}
