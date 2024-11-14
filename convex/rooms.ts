import type { PromiseEntOrNull } from "convex-ents"
import { ConvexError, v, type Infer } from "convex/values"
import { mapValues, toMerged, uniqBy } from "es-toolkit"
import { DEFAULT_INVENTORY_ITEMS } from "~/features/inventory/items.ts"
import { List } from "~/lib/list.ts"
import { mod } from "~/lib/math.ts"
import type { Doc, Id } from "./_generated/dataModel"
import { InaccessibleError, ensureAuthUser, ensureUserId } from "./auth.ts"
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
		} catch {
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
		} catch {
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
		const newItems = { ...room.items }
		for (const key in props.items) {
			const item = props.items[key]
			if (item === null) {
				delete newItems[key]
			} else if (item !== undefined) {
				newItems[key] = item
			}
		}
		return await room.patch({
			...props,
			items: newItems,
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
		} catch {
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
			const user = await ensureAuthUser(ctx)

			const room = await ctx
				.table("rooms", "ownerId")
				.filter((q) =>
					q.and(
						q.eq(q.field("_id"), roomId),
						q.eq(q.field("ownerId"), user._id),
					),
				)
				.uniqueX()

			const players = await room.edge("players").docs()
			return uniqBy([...players, user.doc()], (it) => it._id)
		} catch {
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
			return await normalizeRoomCombat(ctx, room, userId)
		} catch {
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
		const combat = await normalizeRoomCombat(ctx, room, userId)
		const updated = getNextCombatState(combat, action)
		await room.patch({ combat: updated })
	},
})

export function normalizeRoom(room: Ent<"rooms">, userId: Id<"users">) {
	return {
		...room.doc(),
		isOwner: room.ownerId === userId,
		items: mapValues(
			toMerged(DEFAULT_INVENTORY_ITEMS, room.items ?? {}),
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

export async function ensureViewerRoomOwner(
	ctx: EntQueryCtx,
	room: Doc<"rooms">,
) {
	const userId = await ensureUserId(ctx)
	if (!isRoomOwner(room, userId)) {
		throw new InaccessibleError({ table: "rooms", id: room._id })
	}
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

async function normalizeRoomCombat(
	ctx: EntQueryCtx,
	room: Ent<"rooms">,
	userId: Id<"users">,
) {
	const { combat } = room
	if (combat == null) return null

	const memberDocs = await ctx
		.table("characters")
		.getMany(combat.memberIds)
		.then((ents) =>
			ents
				.filter(Boolean)
				.filter((it) => it.roomId === room._id)
				.map((it) => it.doc()),
		)

	const members = memberDocs.map(normalizeCharacter)

	const currentMemberIndex = Math.max(
		members.findIndex((it) => it._id === combat.currentMemberId),
		0,
	)

	return {
		...combat,
		members: members.map((character, index) => ({
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
		const fromIndex = memberIds.indexOf(action.memberId)
		if (fromIndex > -1) {
			memberIds.splice(action.toIndex, 0, ...memberIds.splice(fromIndex, 1))
		}
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
