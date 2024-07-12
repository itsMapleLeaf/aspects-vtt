import { Data, Effect } from "effect"
import { Id } from "../_generated/dataModel"
import { QueryCtx } from "../_generated/server.js"
import { FunctionContextService } from "./effect.ts"

export class RoomNotFoundError extends Data.TaggedError("RoomNotFoundError") {}

export function getRoom(input: { id: Id<"rooms"> } | { slug: string }) {
	return Effect.gen(function* () {
		const ctx = yield* FunctionContextService<QueryCtx>()
		let room
		if ("id" in input) {
			room = yield* Effect.promise(() => ctx.db.get(input.id))
		} else {
			room = yield* Effect.promise(() =>
				ctx.db
					.query("rooms")
					.withIndex("slug", (q) => q.eq("slug", input.slug))
					.first(),
			)
		}
		return room ?? (yield* new RoomNotFoundError())
	})
}
