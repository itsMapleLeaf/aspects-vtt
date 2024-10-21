import { partial } from "convex-helpers/validators"
import { v } from "convex/values"
import { defaults, pick } from "lodash-es"
import { ensureUserId } from "~/convex/auth.new.ts"
import {
	ensureCharacterEntAdmin,
	isCharacterAdmin,
	normalizeCharacter,
	protectCharacter,
} from "~/convex/characters.ts"
import { mutation, query } from "./lib/ents.ts"
import { tableFields } from "./lib/validators.ts"
import { queryViewerOwnedRoom } from "./rooms.ts"

export const list = query({
	args: {
		sceneId: v.id("scenes"),
	},
	async handler(ctx, args) {
		try {
			const userId = await ensureUserId(ctx)
			const scene = await ctx.table("scenes").getX(args.sceneId)
			const room = await scene.edgeX("room")

			const tokens = await scene.edge("characterTokens")
			const protectedTokens = await Promise.all(
				tokens.map(async (token) => {
					const characterEnt = await token.edge("character")
					const character = protectCharacter(
						{
							...normalizeCharacter(characterEnt),
							// if the token is visible, also treat this character as being public
							// for the sake of this function
							visible: token.visible,
						},
						userId,
						room,
					)

					if (!character) {
						return null
					}

					return {
						...defaults(token.doc(), {
							position: { x: 0, y: 0 },
							visible: false,
							updatedAt: 0,
						}),
						character,
					}
				}),
			)

			return protectedTokens.filter((token) => token !== null)
		} catch (error) {
			return []
		}
	},
})

export const get = query({
	args: {
		characterId: v.id("characters"),
		sceneId: v.id("scenes"),
	},
	async handler(ctx, args) {
		try {
			return await ctx
				.table("characterTokens")
				.getX("characterId_sceneId", args.characterId, args.sceneId)
		} catch (error) {
			return null
		}
	},
})

export const create = mutation({
	args: {
		inputs: v.array(
			v.object({
				sceneId: v.id("scenes"),
				characterId: v.id("characters"),
				position: v.optional(v.object({ x: v.number(), y: v.number() })),
				visible: v.optional(v.boolean()),
			}),
		),
	},
	async handler(ctx, { inputs }) {
		for (const args of inputs) {
			const scene = await ctx.table("scenes").getX(args.sceneId)
			await queryViewerOwnedRoom(ctx, scene.edgeX("room"))

			await ctx.table("characterTokens").insert({
				...args,
				updatedAt: Date.now(),
			})
		}
	},
})

export const update = mutation({
	args: {
		updates: v.array(
			v.object({
				...partial(tableFields("characterTokens")),
				tokenId: v.id("characterTokens"),
			}),
		),
	},
	async handler(ctx, { updates }) {
		const userId = await ensureUserId(ctx)
		for (const { tokenId, ...props } of updates) {
			const token = await ctx.table("characterTokens").getX(tokenId)
			const character = await token.edgeX("character")
			const room = await character.edgeX("room")
			if (!isCharacterAdmin(character, room, userId)) {
				await token.patch(pick(props, ["updatedAt", "position"]))
			} else {
				await token.patch(props)
			}
		}
	},
})

export const remove = mutation({
	args: {
		tokenIds: v.array(v.id("characterTokens")),
	},
	async handler(ctx, args) {
		for (const tokenId of args.tokenIds) {
			const token = await ctx.table("characterTokens").getX(tokenId)
			const character = await token.edgeX("character")
			await ensureCharacterEntAdmin(ctx, character)
			await token.delete()
		}
	},
})
