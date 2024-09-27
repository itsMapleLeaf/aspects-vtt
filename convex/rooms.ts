import type { PromiseEntOrNull } from "convex-ents"
import { ConvexError, v, type Infer } from "convex/values"
import { Effect, pipe } from "effect"
import { mapValues, merge, pickBy } from "lodash-es"
import { DEFAULT_INVENTORY_ITEMS } from "~/features/inventory/items.ts"
import { List } from "~/shared/list.ts"
import type { Doc, Id } from "./_generated/dataModel"
import { getAuthUser, getAuthUserId, InaccessibleError } from "./auth.ts"
import { normalizeCharacter, protectCharacter } from "./characters.ts"
import {
	effectMutation,
	effectQuery,
	getQueryCtx,
	queryEnt,
} from "./lib/effects.ts"
import type { Ent } from "./lib/ents.ts"
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
			Effect.all([ent, getAuthUserId(ctx)]),
			Effect.map(([ent, userId]) => normalizeRoom(ent.doc(), userId)),
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

export const getCombat = effectQuery({
	args: {
		roomId: v.id("rooms"),
	},
	handler(ctx, { roomId }) {
		return Effect.gen(function* () {
			const userId = yield* getAuthUserId(ctx)

			const room = yield* queryEnt(ctx.table("rooms").get(roomId))
			const { combat } = room
			if (combat == null) return null

			return yield* normalizeRoomCombat(room, userId)
		}).pipe(Effect.orElseSucceed(() => null))
	},
})

type UpdateCombatAction = Infer<typeof updateCombatActionValidator>
const updateCombatActionValidator = v.union(
	v.object({
		type: v.literal("start"),
	}),
	v.object({
		type: v.literal("stop"),
	}),
	v.object({
		type: v.literal("addMembers"),
		memberIds: v.array(v.id("characters")),
	}),
	v.object({
		type: v.literal("removeMembers"),
		memberIds: v.array(v.id("characters")),
	}),
	v.object({
		type: v.literal("moveMember"),
		memberId: v.id("characters"),
		toIndex: v.number(),
	}),
	v.object({
		type: v.literal("setCurrentMember"),
		memberId: v.id("characters"),
	}),
	v.object({
		type: v.literal("advance"),
	}),
	v.object({
		type: v.literal("rewind"),
	}),
)

export const updateCombat = effectMutation({
	args: {
		roomId: v.id("rooms"),
		action: updateCombatActionValidator,
	},
	handler(ctx, { roomId, action }) {
		return Effect.gen(function* () {
			const userId = yield* getAuthUserId(ctx)
			const room = yield* queryEnt(ctx.table("rooms").get(roomId))
			const combat = yield* normalizeRoomCombat(room, userId)
			const updated = yield* getNextCombatState(combat, action)
			yield* Effect.promise(() => room.patch({ combat: updated }))
		}).pipe(Effect.orDie)
	},
})

export function normalizeRoom(room: Doc<"rooms">, userId: Id<"users">) {
	return {
		...room,
		isOwner: room.ownerId === userId,
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

type NormalizedRoomCombat = NonNullable<
	Effect.Effect.Success<ReturnType<typeof normalizeRoomCombat>>
>

function normalizeRoomCombat(room: Ent<"rooms">, userId: Id<"users">) {
	return Effect.gen(function* () {
		const { combat } = room
		if (combat == null) return null

		const memberDocs = yield* Effect.promise(() =>
			room
				.edge("characters")
				.filter((q) =>
					q.or(...combat.memberIds.map((id) => q.eq(q.field("_id"), id))),
				),
		)

		const orderedMembers = memberDocs
			.map(normalizeCharacter)
			.sort((a, b) => b.resolveMax - a.resolveMax)
			.sort((a, b) => b.attributes.mobility - a.attributes.mobility)

		const currentMemberIndex = Math.max(
			orderedMembers.findIndex((it) => it._id === combat.currentMemberId),
			0,
		)

		return {
			...combat,
			members: orderedMembers.map((character, index) => ({
				id: character._id,
				character: protectCharacter(character, userId, room),
				isCurrent: index === currentMemberIndex,
			})),
			currentMemberIndex,
		}
	})
}

function getNextCombatState(
	combat: NormalizedRoomCombat | null,
	action: UpdateCombatAction,
): Effect.Effect<Doc<"rooms">["combat"], ConvexError<string>> {
	return Effect.gen(function* () {
		if (action.type === "start") {
			return { memberIds: [] }
		}

		if (combat == null) {
			return yield* Effect.fail(
				new ConvexError("Invalid state: combat must be started first"),
			)
		}

		let memberIds = List.from(combat.members)
			.map((it) => it.id)
			.compact()

		let currentMemberId = combat.currentMemberId

		if (action.type === "addMembers") {
			memberIds.push(...action.memberIds)
		} else if (action.type === "removeMembers") {
			memberIds = memberIds.without(...action.memberIds)
		} else if (action.type === "setCurrentMember") {
			currentMemberId = action.memberId
		} else if (action.type === "moveMember") {
			// this one doesn't make sense lol
		} else if (action.type === "advance") {
			currentMemberId =
				memberIds[mod(combat.currentMemberIndex + 1, memberIds.length)]
		} else if (action.type === "rewind") {
			currentMemberId =
				memberIds[mod(combat.currentMemberIndex - 1, memberIds.length)]
		} else if (action.type === "stop") {
			return null
		} else {
			return yield* Effect.fail(
				new ConvexError(
					`Unexpected action: ${JSON.stringify(action, null, 2)}`,
				),
			)
		}

		return { memberIds, currentMemberId }
	})
}

function mod(n: number, m: number) {
	return ((n % m) + m) % m
}
