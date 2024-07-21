import { ConvexError, v } from "convex/values"
import { Effect, pipe } from "effect"
import { getAuthUserId } from "./lib/auth.ts"
import {
	collectDocs,
	getDoc,
	getFirstDoc,
	insertDoc,
	queryIndex,
} from "./lib/db.ts"
import { effectMutation, effectQuery } from "./lib/functions.ts"

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
		id: v.id("rooms"),
	},
	handler: (args) =>
		pipe(
			getDoc(args.id),
			Effect.catchTag("DocNotFoundError", () => Effect.succeed(null)),
		),
})

export const getBySlug = effectQuery({
	args: {
		slug: v.string(),
	},
	handler: ({ slug }) =>
		pipe(
			getRoomBySlug(slug),
			Effect.catchTag("DocNotFoundError", () => Effect.succeed(null)),
		),
})

export const create = effectMutation({
	args: {
		name: v.string(),
		slug: v.string(),
	},
	handler: (args) =>
		pipe(
			Effect.match(getRoomBySlug(args.slug), {
				onSuccess: () => {
					return Effect.fail(
						new ConvexError(`The slug "${args.slug}" is already taken`),
					)
				},
				onFailure: () => Effect.void,
			}),
			Effect.andThen(getAuthUserId),
			Effect.flatMap((userId) =>
				insertDoc("rooms", { ...args, owner: userId }),
			),
		),
})

function getRoomBySlug(slug: string) {
	return pipe(
		queryIndex("rooms", "slug", ["slug", slug]),
		Effect.flatMap(getFirstDoc),
	)
}
