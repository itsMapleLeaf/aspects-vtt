import { partial } from "convex-helpers/validators"
import { v } from "convex/values"
import { toMerged } from "es-toolkit"
import { pick } from "es-toolkit/compat"
import { ensureUserId } from "~/convex/auth.ts"
import { normalizeCharacter, protectCharacter } from "~/convex/characters.ts"
import { mutation, query } from "./lib/ents.ts"
import { tableFields } from "./lib/validators.ts"
import {
	ensureViewerRoomOwner,
	isRoomOwner,
	queryViewerOwnedRoom,
} from "./rooms.ts"
import { normalizeScene } from "./scenes.ts"

export const list = query({
	args: {
		sceneId: v.id("scenes"),
	},
	async handler(ctx, args) {
		try {
			const userId = await ensureUserId(ctx)
			const scene = await ctx.table("scenes").getX(args.sceneId)
			const { cellSize } = normalizeScene(scene)
			const room = await scene.edgeX("room")

			const tokens = await scene.edge("characterTokens")
			const protectedTokens = await Promise.all(
				tokens.map(async (token) => {
					let character
					let size = { x: cellSize, y: cellSize }

					if (token.characterId) {
						const characterEnt = await ctx
							.table("characters")
							.get(token.characterId)
						if (!characterEnt) return

						character = protectCharacter(
							{
								...normalizeCharacter(characterEnt),
								// if the token is visible, also treat this character as being public
								// for the sake of this function
								visible: token.visible,
							},
							userId,
							room,
						)

						// don't show the character token if the character shouldn't be visible
						if (!character) return

						if (characterEnt.defaultTokenSize) {
							size = {
								x: characterEnt.defaultTokenSize,
								y: characterEnt.defaultTokenSize,
							}
						}
					}

					const normalizedToken = toMerged(
						{
							position: { x: 0, y: 0 },
							visible: false,
							updatedAt: 0,
							size,
						},
						token.doc(),
					)

					return {
						...normalizedToken,
						character,
					}
				}),
			)

			return protectedTokens.filter(Boolean)
		} catch {
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
		} catch {
			return null
		}
	},
})

export const create = mutation({
	args: {
		inputs: v.array(
			v.object({
				...tableFields("characterTokens"),
				sceneId: v.id("scenes"),
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
			const room = await token.edge("scene").edge("room")

			if (props.size) {
				props.size = {
					x: Math.round(props.size.x),
					y: Math.round(props.size.y),
				}
				if (token.characterId) {
					const character = await ctx.table("characters").get(token.characterId)
					await character?.patch({ defaultTokenSize: props.size.x })
				}
			}

			if (isRoomOwner(room, userId)) {
				await token.patch(props)
			} else {
				await token.patch(pick(props, ["updatedAt", "position", "size"]))
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
			const room = await token.edge("scene").edge("room")
			await ensureViewerRoomOwner(ctx, room)
			await token.delete()
		}
	},
})
