import type { WithoutSystemFields } from "convex/server"
import { v } from "convex/values"
import { Effect, pipe } from "effect"
import type { Doc, Id, TableNames } from "./_generated/dataModel"
import { mutation } from "./api.ts"
import { Convex, effectMutation } from "./helpers/effect.ts"
import { getRoomBySlug } from "./rooms/functions.ts"

export const create = effectMutation({
	args: {
		model: v.string(),
		data: v.any(),
	},
	handler(args) {
		return ensureTestingEnv(
			pipe(
				Convex.db.insert(args.model as TableNames, args.data),
				Effect.flatMap((id) => Convex.db.get(id)),
			),
		)
	},
})

export const remove = effectMutation({
	args: { ids: v.array(v.string()) },
	handler(args) {
		return ensureTestingEnv(
			Effect.forEach(args.ids, (id) => Convex.db.delete(id as Id<TableNames>)),
		)
	},
})

export const removeRoom = effectMutation({
	args: { slug: v.string() },
	handler(args) {
		return ensureTestingEnv(
			pipe(
				getRoomBySlug(args.slug),
				Effect.flatMap((room) => Convex.db.delete(room._id)),
			),
		)
	},
})

export const createTestRoom = mutation({
	handler(ctx) {
		return ensureTestingEnv(
			Effect.gen(function* () {
				const slug = "test-room"

				// delete the room if it already exists
				yield* ctx.db
					.query("rooms")
					.withIndex("slug", (q) => q.eq("slug", slug))
					.first()
					.pipe(
						Effect.matchEffect({
							onSuccess: (room) => ctx.db.delete(room._id),
							onFailure: () => Effect.succeed(null),
						}),
					)

				const roomData = {
					slug,
					name: "Test Room",
				}
				const roomId = yield* ctx.db.insert("rooms", roomData)

				const characters: WithoutSystemFields<Doc<"characters">>[] = [
					{
						roomId,
						name: "Visible Character",
						visible: true,
						nameVisible: true,
					},
					{
						roomId,
						name: "Character with Hidden Name",
						visible: true,
						nameVisible: false,
					},
					{
						roomId,
						name: "Hidden Character",
						visible: false,
						nameVisible: false,
					},
				]

				for (const character of characters) {
					const existing = yield* ctx.db
						.query("characters")
						.filter((q) => q.eq("name", character.name))
						.firstOrNull()

					if (existing) {
						yield* ctx.db.patch(existing._id, { ...character, roomId })
					} else {
						yield* ctx.db.insert("characters", { ...character, roomId })
					}
				}

				return roomData
			}),
		)
	},
})

function ensureTestingEnv<V, E, S>(effect: Effect.Effect<V, E, S>): Effect.Effect<V, E, S> {
	return process.env.IS_TEST === "true" ? effect : Effect.dieMessage("Not in testing environment")
}
