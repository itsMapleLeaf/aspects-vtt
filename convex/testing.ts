import { v } from "convex/values"
import { Effect } from "effect"
import type { Id, TableNames } from "./_generated/dataModel"
import { Convex, effectMutation } from "./helpers/effect.ts"
import { getRoomBySlug } from "./rooms/functions.ts"

export const create = effectMutation({
	args: {
		model: v.string(),
		data: v.any(),
	},
	handler(args) {
		return ensureTestingEnv().pipe(
			Effect.flatMap(() => Convex.db.insert(args.model as TableNames, args.data)),
			Effect.flatMap((id) => Convex.db.get(id)),
		)
	},
})

export const remove = effectMutation({
	args: { ids: v.array(v.string()) },
	handler(args) {
		return ensureTestingEnv().pipe(
			Effect.tap(() => Effect.forEach(args.ids, (id) => Convex.db.delete(id as Id<TableNames>))),
		)
	},
})

export const removeRoom = effectMutation({
	args: { slug: v.string() },
	handler(args) {
		return ensureTestingEnv().pipe(
			Effect.flatMap(() => getRoomBySlug(args.slug)),
			Effect.flatMap((room) => Convex.db.delete(room._id)),
		)
	},
})

function ensureTestingEnv(): Effect.Effect<null, Error, never> {
	return process.env.IS_TEST === "true" ?
			Effect.succeed(null)
		:	Effect.fail(new Error("Not in testing environment"))
}
