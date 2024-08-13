import { literals, nullable } from "convex-helpers/validators"
import { v } from "convex/values"
import { Effect } from "effect"
import { listAttributeIds } from "../../../app/modules/attributes/data.ts"
import { indexLooped, withMovedItem } from "../../../common/array.ts"
import { unwrap } from "../../../common/errors.ts"
import { mutation } from "../../_generated/server.js"
import { query } from "../../api.ts"
import { CharacterModel } from "../../characters/CharacterModel.ts"
import { QueryCtxService } from "../../helpers/effect.ts"
import { getCurrentUserId } from "../../users.ts"
import { RoomModel } from "../RoomModel.ts"
import { getInitiativeRoll, getRoomCombat } from "./helpers.ts"

export const getCombatMembers = query({
	args: { roomId: v.id("rooms") },
	handler: (ctx, args) =>
		Effect.gen(function* () {
			const userId = yield* getCurrentUserId()
			const room = yield* ctx.db.get(args.roomId)
			const combat = yield* getRoomCombat(ctx, args.roomId)
			const isOwner = room.owner === userId

			// filter out member items that don't have character docs
			const members = yield* Effect.forEach(combat.memberObjects ?? [], (member) =>
				ctx.db.get(member.characterId).pipe(
					Effect.map((character) => ({
						...member,
						name: isOwner || character.nameVisible ? character.name : "???",
						nameVisible: character.nameVisible,
					})),
				),
			)

			const currentMemberId = combat.currentMemberId ?? members[0]?.characterId
			const currentMemberIndex = members.findIndex((it) => it.characterId === currentMemberId)

			return {
				members,
				currentMemberId,
				currentMemberIndex,
			}
		}).pipe(
			Effect.provideService(QueryCtxService, ctx.internal),
			Effect.tapError((error) => {
				if (error._tag === "CombatInactiveError") {
					return Effect.void
				}
				return Effect.logWarning(error)
			}),
			Effect.orElseSucceed(() => ({
				members: [],
				currentMemberId: undefined,
				currentMemberIndex: 0,
			})),
		),
})

export const start = mutation({
	args: {
		id: v.id("rooms"),
		initiativeAttribute: nullable(literals(...listAttributeIds())),
	},
	handler: async (ctx, { id, ...args }) => {
		const room = await RoomModel.fromId(ctx, id).getValueOrThrow()
		await room.assertOwned()

		const scene = room.data.currentScene && (await ctx.db.get(room.data.currentScene))

		const visibleCharacters = await Promise.all(
			scene?.tokens?.map(
				(token) => token.visible && token.characterId && ctx.db.get(token.characterId),
			) ?? [],
		)

		const initialMembers = await Promise.all(
			visibleCharacters.filter(Boolean).map(async (character) => ({
				characterId: character._id,
				initiative: await getInitiativeRoll(ctx, character._id, args.initiativeAttribute),
			})),
		)

		initialMembers.sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0))

		await ctx.db.patch(room.data._id, {
			combat: {
				...args,
				memberObjects: initialMembers,
				currentMemberId: initialMembers[0]?.characterId ?? null,
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

		const { members, currentMemberIndex } = await getCombatMembers(ctx, {
			roomId: room.data._id,
		})

		const nextMember = unwrap(indexLooped(members, currentMemberIndex + 1), "No combat member")

		const nextRoundNumber =
			combat.currentRoundNumber + (currentMemberIndex === members.length - 1 ? 1 : 0)

		await ctx.db.patch(room.data._id, {
			combat: {
				...combat,
				currentMemberId: nextMember.characterId,
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

		const { members, currentMemberIndex } = await getCombatMembers(ctx, {
			roomId: room.data._id,
		})

		// the frontend shouldn't try to call this when at the start of the combat
		if (currentMemberIndex === 0 && combat.currentRoundNumber === 1) {
			throw new Error("Cannot back to the beginning of the combat")
		}

		const previousMember = unwrap(
			indexLooped(members, currentMemberIndex - 1),
			"No previous member",
		)

		const previousRoundNumber = combat.currentRoundNumber - (currentMemberIndex === 0 ? 1 : 0)

		await ctx.db.patch(room.data._id, {
			combat: {
				...combat,
				currentMemberId: previousMember.characterId,
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
		if (combat.memberObjects?.some((it) => it.characterId === character.data._id)) {
			throw new Error("Character is already in combat")
		}

		await ctx.db.patch(room.data._id, {
			combat: {
				...combat,
				memberObjects: [
					...(combat.memberObjects ?? []),
					{
						characterId: character.data._id,
						initiative: await getInitiativeRoll(
							ctx,
							character.data._id,
							combat.initiativeAttribute,
						),
					},
				],
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
		if (!combat.memberObjects?.some((it) => it.characterId === character.data._id)) {
			throw new Error("Character is not in combat")
		}

		await ctx.db.patch(room.data._id, {
			combat: {
				...combat,
				memberObjects: combat.memberObjects?.filter((it) => it.characterId !== character.data._id),
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
		if (!combat.memberObjects?.some((it) => it.characterId === character.data._id)) {
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

		const { members } = await getCombatMembers(ctx, { roomId: room.data._id })
		await ctx.db.patch(room.data._id, {
			combat: {
				...combat,
				memberObjects: withMovedItem(members, args.fromIndex, args.toIndex),
			},
		})
	},
})
