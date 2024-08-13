import type { WithoutSystemFields } from "convex/server"
import { v } from "convex/values"
import { Effect, pipe } from "effect"
import { unwrap } from "../common/errors.ts"
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

				const characterData: WithoutSystemFields<Doc<"characters">>[] = [
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

				const characterDocs = yield* Effect.forEach(
					characterData,
					(character) => {
						return Effect.gen(function* () {
							const existing = yield* ctx.db
								.query("characters")
								.filter((q) => q.eq("name", character.name))
								.firstOrNull()

							let id
							if (existing) {
								yield* ctx.db.patch(existing._id, { ...character, roomId })
								id = existing._id
							} else {
								id = yield* ctx.db.insert("characters", {
									...character,
									roomId,
								})
							}
							return { ...character, _id: id }
						})
					},
				)

				yield* ctx.db.patch(roomId, {
					combat: {
						currentRoundNumber: 1,
						initiativeAttribute: "mobility",
						memberObjects: [
							{ characterId: unwrap(characterDocs[0])._id, initiative: null },
							{ characterId: unwrap(characterDocs[1])._id, initiative: null },
							{ characterId: unwrap(characterDocs[2])._id, initiative: null },
						],
					},
				})

				return roomData
			}),
		)
	},
})

function ensureTestingEnv<V, E, S>(
	effect: Effect.Effect<V, E, S>,
): Effect.Effect<V, E, S> {
	return process.env.IS_TEST === "true" ?
			effect
		:	Effect.dieMessage("Not in testing environment")
}
