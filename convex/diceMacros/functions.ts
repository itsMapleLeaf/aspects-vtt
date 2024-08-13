import { ConvexError, v } from "convex/values"
import { Effect, pipe } from "effect"
import { Convex, effectMutation, effectQuery } from "../helpers/effect.ts"
import schema from "../schema.ts"
import { getCurrentUserId } from "../users.ts"

export const list = effectQuery({
	args: {
		roomId: v.id("rooms"),
	},
	handler(args) {
		return pipe(
			getCurrentUserId(),
			Effect.flatMap((user) =>
				Convex.db
					.query("diceMacros")
					.withIndex("roomId_user", (q) =>
						q.eq("roomId", args.roomId).eq("user", user),
					)
					.collect(),
			),
			Effect.orElseSucceed(() => []),
		)
	},
})

export const create = effectMutation({
	args: schema.tables.diceMacros.validator.fields,
	handler(args) {
		return pipe(
			getCurrentUserId(),
			Effect.flatMap((user) =>
				Convex.db.insert("diceMacros", { ...args, user }),
			),
		)
	},
})

export const remove = effectMutation({
	args: {
		id: v.id("diceMacros"),
	},
	handler(args) {
		return pipe(
			Effect.all({
				user: getCurrentUserId(),
				macro: Convex.db.get(args.id),
			}),
			Effect.filterOrFail(
				({ user, macro }) => macro.user === user,
				() => new ConvexError("Insufficient permissions"),
			),
			Effect.flatMap(({ macro }) => Convex.db.delete(macro._id)),
		)
	},
})
