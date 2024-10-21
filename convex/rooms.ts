import type { PromiseEntOrNull } from "convex-ents"
import { ConvexError, v, type Infer } from "convex/values"
import { mapValues, merge, pickBy } from "lodash-es"
import { DEFAULT_INVENTORY_ITEMS } from "~/features/inventory/items.ts"
import { List } from "~/shared/list.ts"
import { mod } from "../src/common/math.ts"
import type { Doc, Id } from "./_generated/dataModel"
import { ensureUserId, InaccessibleError } from "./auth.new.ts"
import { normalizeCharacter, protectCharacter } from "./characters.ts"
import { mutation, query, type Ent, type EntQueryCtx } from "./lib/ents.ts"
import { partial, tableFields } from "./lib/validators.ts"
import { roomItemValidator, type entDefinitions } from "./schema.ts"

export const list = query({
	async handler(ctx) {
		try {
			const userId = await ensureUserId(ctx)
			const user = await ctx.table("users").getX(userId)
			const ownedRooms = await user.edge("ownedRooms").map((ent) => ent.doc())
			const joinedRooms = await user.edge("joinedRooms").map((ent) => ent.doc())
			return [...ownedRooms, ...joinedRooms]
		} catch (error) {
			return []
		}
	},
})

export const get = query({
	args: {
		id: v.string(),
	},
	async handler(ctx, args) {
		try {
			const userId = await ensureUserId(ctx)
			const id = ctx.table("rooms").normalizeId(args.id)

			let ent
			if (id) {
				ent = await ctx.table("rooms").getX(id)
			} else {
				ent = await ctx.table("rooms").getX("slug", args.id)
			}

			return normalizeRoom(ent, userId)
		} catch (error) {
			return null
		}
	},
})

export const create = mutation({
	args: {
		name: v.string(),
		slug: v.string(),
	},
	async handler(ctx, args) {
		const userId = await ensureUserId(ctx)
		const existingRoom = await ctx.table("rooms").get("slug", args.slug)
		if (existingRoom) {
			throw new ConvexError(
				`The URL "${args.slug}" is already taken. Choose another one.`,
			)
		}
		return await ctx.table("rooms").insert({
			...args,
			ownerId: userId,
		})
	},
})

export const update = mutation({
	args: {
		...partial(tableFields("rooms")),
		roomId: v.id("rooms"),
		items: v.optional(
			v.record(v.string(), v.union(roomItemValidator, v.null())),
		),
	},
	async handler(ctx, { roomId, ...props }) {
		const { room } = await queryViewerOwnedRoom(
			ctx,
			ctx.table("rooms").get(roomId),
		)
		return await room.patch({
			...props,
			items: pickBy({ ...room.items, ...props.items }, (it) => it !== null),
		})
	},
})

export const remove = mutation({
	args: {
		roomId: v.id("rooms"),
	},
	async handler(ctx, args) {
		const { room } = await queryViewerOwnedRoom(
			ctx,
			ctx.table("rooms").get(args.roomId),
		)
		await room.delete()
	},
})

export const getJoined = query({
	args: {
		roomId: v.id("rooms"),
	},
	async handler(ctx, { roomId }) {
		try {
			const userId = await ensureUserId(ctx)
			const room = await ctx.table("rooms").getX(roomId)

			if (room.ownerId === userId) {
				return true
			}

			const players = await room.edge("players").docs()
			return players.some((it) => it._id === userId)
		} catch (error) {
			return false
		}
	},
})

export const join = mutation({
	args: {
		roomId: v.id("rooms"),
	},
	async handler(ctx, { roomId }) {
		const userId = await ensureUserId(ctx)
		await ctx
			.table("users")
			.getX(userId)
			.patch({
				joinedRooms: {
					add: [roomId],
				},
			})
	},
})

export const getPlayers = query({
	args: {
		roomId: v.id("rooms"),
	},
	async handler(ctx, { roomId }) {
		try {
			const { room } = await queryViewerOwnedRoom(
				ctx,
				ctx.table("rooms").get(roomId),
			)
			return await room.edge("players").docs()
		} catch (error) {
			return []
		}
	},
})

export const getCombat = query({
	args: {
		roomId: v.id("rooms"),
	},
	async handler(ctx, { roomId }) {
		try {
			const userId = await ensureUserId(ctx)
			const room = await ctx.table("rooms").getX(roomId)
			const { combat } = room
			if (combat == null) return null
			return await normalizeRoomCombat(room, userId)
		} catch (error) {
			return null
		}
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

export const updateCombat = mutation({
	args: {
		roomId: v.id("rooms"),
		action: updateCombatActionValidator,
	},
	async handler(ctx, { roomId, action }) {
		const userId = await ensureUserId(ctx)
		const room = await ctx.table("rooms").getX(roomId)
		const combat = await normalizeRoomCombat(room, userId)
		const updated = getNextCombatState(combat, action)
		await room.patch({ combat: updated })
	},
})

export function normalizeRoom(room: Ent<"rooms">, userId: Id<"users">) {
	return {
		...room.doc(),
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

export async function queryViewerOwnedRoom<
	Query extends PromiseEntOrNull<typeof entDefinitions, "rooms">,
>(ctx: EntQueryCtx, query: Query) {
	const userId = await ensureUserId(ctx)
	const room = await query
	if (!room || room.ownerId !== userId) {
		throw new InaccessibleError({ table: "rooms" })
	}
	return { userId, room: room as NonNullable<Awaited<Query>> }
}

type NormalizedRoomCombat = NonNullable<
	Awaited<ReturnType<typeof normalizeRoomCombat>>
>

async function normalizeRoomCombat(room: Ent<"rooms">, userId: Id<"users">) {
	const { combat } = room
	if (combat == null) return null

	const memberDocs = await room
		.edge("characters")
		.filter((q) =>
			q.or(...combat.memberIds.map((id) => q.eq(q.field("_id"), id))),
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
			imageId: character.imageId,
			character: protectCharacter(character, userId, room),
			isCurrent: index === currentMemberIndex,
		})),
		currentMemberIndex,
	}
}

function getNextCombatState(
	combat: NormalizedRoomCombat | null,
	action: UpdateCombatAction,
): Doc<"rooms">["combat"] {
	if (action.type === "start") {
		return { memberIds: [] }
	}

	if (combat == null) {
		throw new ConvexError("Invalid state: combat must be started first")
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
		throw new ConvexError(
			`Unexpected action: ${JSON.stringify(action, null, 2)}`,
		)
	}

	return { memberIds, currentMemberId }
}
