import { v } from "convex/values"
import { CharacterModel } from "../CharacterModel.js"
import { RoomModel } from "../RoomModel.js"
import { mutation } from "../_generated/server.js"

export const start = mutation({
	args: {
		id: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		const room = await RoomModel.fromId(ctx, args.id).getValueOrThrow()
		await room.assertOwned()

		const memberCharacters = await ctx.db
			.query("characters")
			.withIndex("by_room", (q) => q.eq("roomId", room.data._id))
			.filter((q) => q.eq(q.field("visible"), true))
			.collect()

		await ctx.db.patch(room.data._id, {
			combat: {
				members: memberCharacters.map((c) => c._id),
				currentMemberIndex: 0,
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

		const { currentMemberIndex, currentRoundNumber, members } = combat
		if (currentMemberIndex === members.length - 1) {
			await ctx.db.patch(room.data._id, {
				combat: {
					...combat,
					currentMemberIndex: 0,
					currentRoundNumber: currentRoundNumber + 1,
				},
			})
		} else {
			await ctx.db.patch(room.data._id, {
				combat: {
					...combat,
					currentMemberIndex: currentMemberIndex + 1,
					currentRoundNumber: currentRoundNumber,
				},
			})
		}
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

		const { currentMemberIndex, currentRoundNumber, members } = combat
		if (currentMemberIndex === 0 && currentRoundNumber === 1) {
			throw new Error("Cannot back to the beginning of the combat")
		}

		if (currentMemberIndex === 0) {
			await ctx.db.patch(room.data._id, {
				combat: {
					...combat,
					currentMemberIndex: members.length - 1,
					currentRoundNumber: currentRoundNumber - 1,
				},
			})
		} else {
			await ctx.db.patch(room.data._id, {
				combat: {
					...combat,
					currentMemberIndex: currentMemberIndex - 1,
					currentRoundNumber: currentRoundNumber,
				},
			})
		}
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
				currentMemberIndex: 0,
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
