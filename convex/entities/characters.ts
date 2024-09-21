import { partial } from "convex-helpers/validators"
import type { WithoutSystemFields } from "convex/server"
import { v } from "convex/values"
import { Doc, type Id } from "../_generated/dataModel"
import {
	InaccessibleError,
	protectedMutation,
	protectedQuery,
	type ProtectedCtx,
} from "../lib/auth.ts"
import type { EntMutationCtx } from "../lib/ents.ts"
import schema from "../schema.ts"
import { isRoomOwner } from "./rooms.ts"

export const get = protectedQuery({
	args: {
		characterId: v.id("characters"),
	},
	fallback: null,
	handler: async (ctx, args) => {
		const character = await ctx.table("characters").get(args.characterId)
		if (!character) {
			return null
		}

		return protectCharacter(character, ctx.userId, await character.edge("room"))
	},
})

export const list = protectedQuery({
	args: {
		roomId: v.id("rooms"),
		search: v.optional(v.string()),
	},
	fallback: [],
	handler: async (ctx, { roomId, search }) => {
		let characters
		if (search) {
			characters = ctx
				.table("characters")
				.search("name", (q) => q.search("name", search).eq("roomId", roomId))
		} else {
			characters = ctx.table("characters", "roomId", (q) =>
				q.eq("roomId", roomId),
			)
		}

		return characters
			.map(async (it) =>
				protectCharacter(it, ctx.userId, await it.edge("room")),
			)
			.filter((it) => it != null)
	},
})

export const create = protectedMutation({
	args: {
		...partial(schema.tables.characters.validator.fields),
		roomId: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		return createCharacter(ctx, args)
	},
})

export const update = protectedMutation({
	args: {
		...partial(schema.tables.characters.validator.fields),
		characterId: v.id("characters"),
	},
	handler: async (ctx, { characterId, ...args }) => {
		const character = await ctx.table("characters").getX(characterId)
		const room = await character.edgeX("room")

		const authorized =
			isRoomOwner(room, ctx.userId) || character.ownerId === ctx.userId

		if (!authorized) {
			throw new InaccessibleError({
				id: characterId,
				collection: "characters",
			})
		}

		await character.patch(args)
	},
})

export const remove = protectedMutation({
	args: {
		characterIds: v.array(v.id("characters")),
	},
	handler: async (ctx, args) => {
		for (const characterId of args.characterIds) {
			const character = await ctx.table("characters").getX(characterId)
			const room = await character.edgeX("room")

			const authorized =
				isRoomOwner(room, ctx.userId) || character.ownerId === ctx.userId

			if (!authorized) {
				throw new InaccessibleError({
					id: characterId,
					collection: "characters",
				})
			}

			await character.delete()
		}
	},
})

export const duplicate = protectedMutation({
	args: {
		characterIds: v.array(v.id("characters")),
	},
	handler: async (ctx, args) => {
		for (const characterId of args.characterIds) {
			const character = await ctx.table("characters").get(characterId)
			if (character) {
				const { _id, _creationTime, ...characterData } = character
				await createCharacter(ctx, characterData)
			}
		}
	},
})

async function createCharacter(
	ctx: ProtectedCtx<EntMutationCtx>,
	args: Partial<WithoutSystemFields<Doc<"characters">>> & {
		roomId: Id<"rooms">
	},
) {
	return await ctx.table("characters").insert({
		name: "New Character",
		...args,
		ownerId: ctx.userId,
		updatedAt: Date.now(),
	})
}

function protectCharacter(
	character: Doc<"characters">,
	userId: Id<"users">,
	room: Doc<"rooms">,
) {
	if (isRoomOwner(room, userId) || character.playerId === userId) {
		return character
	}

	if (character.visible && character.nameVisible) {
		return {
			_id: character._id,
			name: character.name,
			pronouns: character.pronouns,
			imageId: character.imageId,
		} satisfies Partial<Doc<"characters">>
	}

	if (character.visible) {
		return {
			_id: character._id,
			imageId: character.imageId,
		} satisfies Partial<Doc<"characters">>
	}

	return null
}
