import { v } from "convex/values"
import { Effect, pipe } from "effect"
import { query, QueryCtx } from "./_generated/server.js"
import { getAuthUserId } from "./lib/auth.ts"
import { endpoint, FunctionContextService } from "./lib/effect.ts"
import { getRoom } from "./lib/rooms.ts"

export const list = endpoint(query, {
	handler: Effect.gen(function* () {
		const userId = yield* getAuthUserId()
		const ctx = yield* FunctionContextService<QueryCtx>()
		return yield* Effect.promise(() =>
			ctx.db
				.query("rooms")
				.withIndex("owner", (q) => q.eq("owner", userId))
				.collect(),
		)
	}).pipe(Effect.catchTag("UnauthenticatedError", () => Effect.succeed([]))),
})

export const get = endpoint(query, {
	args: {
		input: v.union(
			v.object({ id: v.id("rooms") }),
			v.object({ slug: v.string() }),
		),
	},
	handler: (args) =>
		pipe(
			getRoom(args.input),
			Effect.catchTag("RoomNotFoundError", () => Effect.succeed(null)),
		),
})
