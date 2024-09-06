import { partial } from "convex-helpers/validators"
import { v } from "convex/values"
import { Effect } from "effect"
import { Iterator } from "iterator-helpers-polyfill"
import { clamp } from "lodash-es"
import { Doc } from "../_generated/dataModel"
import { LocalQueryContext, mutation, query } from "../lib/api.ts"
import { getStorageUrl } from "../lib/storage.ts"
import schema from "../schema.ts"

export const get = query({
	args: {
		characterId: v.id("characters"),
	},
	handler(ctx, args) {
		return ctx.db.get(args.characterId).pipe(
			Effect.flatMap((char) => normalizeCharacter(ctx, char)),
			Effect.orElseSucceed(() => null),
		)
	},
})

export const list = query({
	args: {
		roomId: v.id("rooms"),
		search: v.optional(v.string()),
	},
	handler(ctx, args) {
		let query
		query = ctx.db.query("characters")

		if (args.search) {
			query = query.withSearchIndex("name", (q) =>
				q.search("name", args.search!).eq("roomId", args.roomId),
			)
		} else {
			query = query.withIndex("roomId", (q) => q.eq("roomId", args.roomId))
		}

		return query
			.collect()
			.pipe(
				Effect.flatMap((chars) =>
					Effect.allSuccesses(
						Iterator.from(chars).map((it) => normalizeCharacter(ctx, it)),
					),
				),
			)
	},
})

export const create = mutation({
	args: {
		roomId: v.id("rooms"),
	},
	handler(ctx, args) {
		return ctx.db.insert("characters", {
			roomId: args.roomId,
			name: "New Character",
		})
	},
})

export const update = mutation({
	args: {
		...partial(schema.tables.characters.validator.fields),
		characterId: v.id("characters"),
	},
	handler(ctx, { characterId, ...args }) {
		return ctx.db.patch(characterId, args)
	},
})

export const remove = mutation({
	args: {
		characterIds: v.array(v.id("characters")),
	},
	handler(ctx, args) {
		return Effect.gen(function* () {
			for (const characterId of args.characterIds) {
				yield* ctx.db.delete(characterId)
			}
		}).pipe(Effect.orDie)
	},
})

export const duplicate = mutation({
	args: {
		characterIds: v.array(v.id("characters")),
	},
	handler(ctx, args) {
		return Effect.gen(function* () {
			for (const characterId of args.characterIds) {
				const { _id, _creationTime, ...character } =
					yield* ctx.db.get(characterId)
				yield* ctx.db.insert("characters", character)
			}
		}).pipe(Effect.orDie)
	},
})

export function normalizeCharacter(
	ctx: LocalQueryContext,
	doc: Doc<"characters">,
) {
	return Effect.gen(function* () {
		const imageUrl = doc.imageId ? yield* getStorageUrl(ctx, doc.imageId) : null

		const attributes = {
			strength: normalizeAttribute(doc.strength),
			sense: normalizeAttribute(doc.sense),
			mobility: normalizeAttribute(doc.mobility),
			intellect: normalizeAttribute(doc.intellect),
			wit: normalizeAttribute(doc.wit),
		}

		const healthMax =
			getAttributeDie(attributes.strength) +
			getAttributeDie(attributes.mobility)
		const resolveMax = attributes.sense + attributes.intellect + attributes.wit
		return {
			...doc,
			...attributes,

			imageUrl,

			health: doc.health ?? healthMax,
			healthMax,

			resolve: doc.resolve ?? resolveMax,
			resolveMax,
		}
	})
}

function normalizeAttribute(attribute: number | undefined): number {
	return clamp(attribute ?? 1, 1, 5)
}

function getAttributeDie(attribute: number) {
	return [4, 6, 8, 10, 12][normalizeAttribute(attribute) - 1] as number
}
