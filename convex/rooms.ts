import type { PromiseEntOrNull } from "convex-ents"
import { ConvexError, v } from "convex/values"
import { Effect, pipe } from "effect"
import { mapValues, merge, pickBy } from "lodash-es"
import { DEFAULT_INVENTORY_ITEMS } from "~/features/inventory/items.ts"
import type { Doc, Id } from "./_generated/dataModel"
import { getAuthUser, getAuthUserId, InaccessibleError } from "./auth.ts"
import {
	effectMutation,
	effectQuery,
	getQueryCtx,
	queryEnt,
} from "./lib/effects.ts"
import { partial, tableFields } from "./lib/validators.ts"
import { roomItemValidator, type entDefinitions } from "./schema.ts"

export const list = effectQuery({
	handler(ctx) {
		return pipe(
			getAuthUser(ctx),
			Effect.flatMap((ent) =>
				Effect.promise(() => ent.edge("rooms").map((ent) => ent.doc())),
			),
			Effect.orElseSucceed(() => []),
		)
	},
})

export const get = effectQuery({
	args: {
		id: v.string(),
	},
	handler(ctx, args) {
		const id = ctx.table("rooms").normalizeId(args.id)

		let ent
		if (id) {
			ent = queryEnt(ctx.table("rooms").get(id))
		} else {
			ent = queryEnt(ctx.table("rooms").get("slug", args.id))
		}

		return pipe(
			ent,
			Effect.map((ent) => normalizeRoom(ent.doc())),
			Effect.orElseSucceed(() => null),
		)
	},
})

export const create = effectMutation({
	args: {
		name: v.string(),
		slug: v.string(),
	},
	handler(ctx, args) {
		return pipe(
			getAuthUserId(ctx),
			Effect.flatMap((userId) =>
				pipe(
					Effect.promise(() => ctx.table("rooms").get("slug", args.slug)),
					Effect.filterOrDie(
						(ent) => ent == null,
						() =>
							new ConvexError(
								`The URL "${args.slug}" is already taken. Choose another one.`,
							),
					),
					Effect.flatMap(() =>
						Effect.promise(() =>
							ctx.table("rooms").insert({
								...args,
								ownerId: userId,
							}),
						),
					),
				),
			),
			Effect.orDie,
		)
	},
})

export const update = effectMutation({
	args: {
		...partial(tableFields("rooms")),
		roomId: v.id("rooms"),
		items: v.record(v.string(), v.union(roomItemValidator, v.null())),
	},
	handler(ctx, { roomId, ...props }) {
		return pipe(
			queryViewerOwnedRoom(ctx.table("rooms").get(roomId)),
			Effect.flatMap(({ room }) =>
				Effect.promise(() =>
					room.patch({
						...props,
						items: pickBy(
							{ ...room.items, ...props.items },
							(it) => it !== null,
						),
					}),
				),
			),
			Effect.orDie,
		)
	},
})

export const remove = effectMutation({
	args: {
		roomId: v.id("rooms"),
	},
	handler(ctx, args) {
		return pipe(
			queryViewerOwnedRoom(ctx.table("rooms").get(args.roomId)),
			Effect.flatMap(({ room }) => Effect.promise(() => room.delete())),
			Effect.orDie,
		)
	},
})

export function normalizeRoom(room: Doc<"rooms">) {
	return {
		...room,
		items: mapValues(
			merge({}, DEFAULT_INVENTORY_ITEMS, room.items),
			(item, _id) => ({
				...item,
				_id,
			}),
		),
	}
}

export function isRoomOwner(room: Doc<"rooms">, userId: Id<"users">) {
	return room.ownerId === userId
}

export function queryViewerOwnedRoom<
	Query extends PromiseEntOrNull<typeof entDefinitions, "rooms">,
>(query: Query) {
	return pipe(
		Effect.Do,
		Effect.bind("ctx", () => getQueryCtx()),
		Effect.bind("userId", ({ ctx }) => getAuthUserId(ctx)),
		Effect.bind("room", () => Effect.promise(() => query)),
		Effect.filterOrFail(
			({ room, userId }) => room != null && room.ownerId === userId,
			() => new InaccessibleError({ table: "rooms" }),
		),
		Effect.map(({ room, userId }) => ({
			userId,
			room: room as NonNullable<Awaited<Query>>,
		})),
	)
}
