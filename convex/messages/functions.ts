import { ConvexError, v } from "convex/values"
import { Console, Effect } from "effect"
import { Iterator } from "iterator-helpers-polyfill"
import { pick } from "../../common/object.ts"
import { mutation } from "../_generated/server.js"
import { getUserFromIdentity } from "../auth.ts"
import {
	Convex,
	effectMutation,
	effectQuery,
	withQueryCtx,
} from "../helpers/effect.js"
import { createMessages } from "./helpers.ts"
import { diceInputValidator } from "./types.ts"

export const list = effectQuery({
	args: {
		roomId: v.id("rooms"),
	},
	handler(args) {
		return Effect.gen(function* () {
			const messages = yield* withQueryCtx((ctx) =>
				ctx.db
					.query("messages")
					.withIndex("roomId", (q) => q.eq("roomId", args.roomId))
					.order("desc")
					.take(20),
			)

			return yield* Effect.allSuccesses(
				Iterator.from(messages).map((message) =>
					Effect.gen(function* () {
						const user = yield* Effect.fromNullable(message.user).pipe(
							Effect.flatMap(Convex.db.get),
							Effect.map((user) => pick(user, ["name", "avatarUrl"])),
							Effect.catchTag("NoSuchElementException", () =>
								Effect.succeed(null),
							),
							Effect.catchTag("ConvexDocNotFoundError", () =>
								Effect.succeed(null),
							),
						)
						return { ...message, user }
					}).pipe(
						Effect.tapError((cause) =>
							Console.warn("message failed", message, cause, message),
						),
					),
				),
			)
		})
	},
})

export const create = effectMutation({
	args: {
		roomId: v.id("rooms"),
		content: v.optional(v.string()),
		dice: v.optional(v.array(diceInputValidator)),
	},
	handler(args) {
		return createMessages([args]).pipe(
			Effect.map((messages) => messages[0]),
			Effect.flatMap((it) => Effect.orDie(Effect.fromNullable(it))),
		)
	},
})

export const remove = mutation({
	args: {
		id: v.id("messages"),
	},
	async handler(ctx, { id }) {
		const user = await getUserFromIdentity(ctx).getValueOrThrow()

		const message = await ctx.db.get(id)
		if (!message) return

		if (message.user !== user._id) {
			throw new ConvexError("You don't have permission to do that.")
		}

		await ctx.db.delete(id)
	},
})
