import { deprecated, nullable } from "convex-helpers/validators"
import { v } from "convex/values"
import { indexLooped, withMovedItem } from "#app/common/array.ts"
import { keyedByProperty } from "#app/common/collection.js"
import { expect } from "#app/common/expect.ts"
import type { Id } from "#convex/_generated/dataModel.js"
import { CharacterModel } from "../CharacterModel.ts"
import { RoomModel } from "../RoomModel.ts"
import { mutation, query } from "../_generated/server.js"

export const roomCombatValidator = v.object({
	members: v.array(v.id("characters")),
	currentMemberId: nullable(v.id("characters")),
	currentRoundNumber: v.number(),
	currentMemberIndex: deprecated,
})

export const getCombatMembers = query({
	args: { roomId: v.id("rooms") },
	handler: async (ctx, args) => {
		const { value: room } = await RoomModel.fromId(ctx, args.roomId)
		const combat = room?.data.combat

		let memberIds: Id<"characters">[] = []
		let currentMemberId: Id<"characters"> | undefined
		let currentMemberIndex = 0

		if (combat) {
			const members = await ctx.db
				.query("characters")
				.withIndex("by_room", (q) => q.eq("roomId", room.data._id))
				.filter((q) => q.or(...combat.members.map((memberId) => q.eq(q.field("_id"), memberId))))
				.collect()

			const membersById = keyedByProperty(members, "_id")

			const currentMember =
				(room.data.combat?.currentMemberId && membersById.get(room.data.combat.currentMemberId)) ||
				members[0]

			memberIds = combat.members.filter((id) => membersById.has(id))
			currentMemberId = currentMember?._id
			if (currentMemberId) {
				currentMemberIndex = memberIds.indexOf(currentMemberId)
				currentMemberIndex = Math.max(currentMemberIndex, 0)
			}
		}

		return {
			memberIds: memberIds ?? [],
			currentMemberId,
			currentMemberIndex,
		}
	},
})

export const start = mutation({
	args: {
		id: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		const room = await RoomModel.fromId(ctx, args.id).getValueOrThrow()
		await room.assertOwned()

		const initialMembers = await ctx.db
			.query("characters")
			.withIndex("by_room", (q) => q.eq("roomId", room.data._id))
			.filter((q) => q.eq(q.field("visible"), true))
			.collect()

		await ctx.db.patch(room.data._id, {
			combat: {
				members: initialMembers.map((c) => c._id),
				currentMemberId: initialMembers[0]?._id ?? null,
				currentRoundNumber: 1,
			},
		})
	},
})

export const end = mutation({
	args: {
		id: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		const room = await RoomModel.fromId(ctx, args.id).getValueOrThrow()
		await room.assertOwned()
		await ctx.db.patch(room.data._id, { combat: null })
	},
})

export const advance = mutation({
	args: {
		id: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		const room = await RoomModel.fromId(ctx, args.id).getValueOrThrow()
		await room.assertOwned()

		const combat = room.data.combat
		if (!combat) {
			throw new Error("Combat is inactive")
		}

		const { memberIds: members, currentMemberIndex } = await getCombatMembers(ctx, {
			roomId: room.data._id,
		})

		const nextMemberId = expect(indexLooped(members, currentMemberIndex + 1), "No combat member")

		const nextRoundNumber =
			combat.currentRoundNumber + (currentMemberIndex === members.length - 1 ? 1 : 0)

		await ctx.db.patch(room.data._id, {
			combat: {
				...combat,
				currentMemberId: nextMemberId,
				currentRoundNumber: nextRoundNumber,
			},
		})
	},
})

export const back = mutation({
	args: {
		id: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		const room = await RoomModel.fromId(ctx, args.id).getValueOrThrow()
		await room.assertOwned()

		const combat = room.data.combat
		if (!combat) {
			throw new Error("Combat is inactive")
		}

		const { memberIds: members, currentMemberIndex } = await getCombatMembers(ctx, {
			roomId: room.data._id,
		})

		// the frontend shouldn't try to call this when at the start of the combat
		if (currentMemberIndex === 0 && combat.currentRoundNumber === 1) {
			throw new Error("Cannot back to the beginning of the combat")
		}

		const previousMemberId = expect(
			indexLooped(members, currentMemberIndex - 1),
			"No previous member",
		)

		const previousRoundNumber = combat.currentRoundNumber - (currentMemberIndex === 0 ? 1 : 0)

		await ctx.db.patch(room.data._id, {
			combat: {
				...combat,
				currentMemberId: previousMemberId,
				currentRoundNumber: previousRoundNumber,
			},
		})
	},
})

export const reset = mutation({
	args: {
		id: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		const room = await RoomModel.fromId(ctx, args.id).getValueOrThrow()
		await room.assertOwned()

		const combat = room.data.combat
		if (!combat) {
			throw new Error("Combat is inactive")
		}

		await ctx.db.patch(room.data._id, {
			combat: {
				...combat,
				currentMemberId: null,
				currentRoundNumber: 1,
			},
		})
	},
})

export const addMember = mutation({
	args: {
		id: v.id("rooms"),
		characterId: v.id("characters"),
	},
	handler: async (ctx, args) => {
		const room = await RoomModel.fromId(ctx, args.id).getValueOrThrow()
		await room.assertOwned()

		const combat = room.data.combat
		if (!combat) {
			throw new Error("Combat is inactive")
		}

		const character = await CharacterModel.get(ctx, args.characterId).getValueOrThrow()
		if (combat.members.includes(character.data._id)) {
			throw new Error("Character is already in combat")
		}

		await ctx.db.patch(room.data._id, {
			combat: {
				...combat,
				members: [...combat.members, character.data._id],
			},
		})
	},
})

export const removeMember = mutation({
	args: {
		id: v.id("rooms"),
		characterId: v.id("characters"),
	},
	handler: async (ctx, args) => {
		const room = await RoomModel.fromId(ctx, args.id).getValueOrThrow()
		await room.assertOwned()

		const combat = room.data.combat
		if (!combat) {
			throw new Error("Combat is inactive")
		}

		const character = await CharacterModel.get(ctx, args.characterId).getValueOrThrow()
		if (!combat.members.includes(character.data._id)) {
			throw new Error("Character is not in combat")
		}

		await ctx.db.patch(room.data._id, {
			combat: {
				...combat,
				members: combat.members.filter((id) => id !== character.data._id),
			},
		})
	},
})

export const setCurrentMember = mutation({
	args: {
		id: v.id("rooms"),
		characterId: v.id("characters"),
	},
	handler: async (ctx, args) => {
		const room = await RoomModel.fromId(ctx, args.id).getValueOrThrow()
		await room.assertOwned()

		const combat = room.data.combat
		if (!combat) {
			throw new Error("Combat is inactive")
		}

		const character = await CharacterModel.get(ctx, args.characterId).getValueOrThrow()
		if (!combat.members.includes(character.data._id)) {
			throw new Error("Character is not in combat")
		}

		await ctx.db.patch(room.data._id, {
			combat: {
				...combat,
				currentMemberId: character.data._id,
			},
		})
	},
})

export const moveMember = mutation({
	args: {
		id: v.id("rooms"),
		fromIndex: v.number(),
		toIndex: v.number(),
	},
	handler: async (ctx, args) => {
		const room = await RoomModel.fromId(ctx, args.id).getValueOrThrow()
		await room.assertOwned()

		const combat = room.data.combat
		if (!combat) {
			throw new Error("Combat is inactive")
		}

		const { memberIds } = await getCombatMembers(ctx, { roomId: room.data._id })

		const updated = withMovedItem(memberIds, args.fromIndex, args.toIndex)
		console.log(memberIds, args.fromIndex, args.toIndex, updated)

		await ctx.db.patch(room.data._id, {
			combat: {
				...combat,
				members: updated,
			},
		})
	},
})
