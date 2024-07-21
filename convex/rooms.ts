import { v } from "convex/values"
import { Effect, pipe } from "effect"
import { getAuthUserId } from "./lib/auth.ts"
import { collectDocs, queryIndex } from "./lib/db.ts"
import { effectQuery } from "./lib/functions.ts"
import { getRoom } from "./lib/rooms.ts"

export const list = effectQuery({
	handler: () =>
		pipe(
			getAuthUserId(),
			Effect.flatMap((userId) =>
				queryIndex("rooms", "owner", ["owner", userId]),
			),
			Effect.flatMap(collectDocs),
			Effect.catchTag("UnauthenticatedError", () => Effect.succeed([])),
		),
})

export const get = effectQuery({
	args: {
		input: v.union(
			v.object({ id: v.id("rooms") }),
			v.object({ slug: v.string() }),
		),
	},
	handler: (args) =>
		pipe(
			getRoom(args.input),
			Effect.catchTag("DocNotFoundError", () => Effect.succeed(null)),
		),
})
