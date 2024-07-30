"use node"

import { createHash } from "node:crypto"
import { v } from "convex/values"
import sharp from "sharp"
import { internal } from "./_generated/api.js"
import type { Id } from "./_generated/dataModel.js"
import { type ActionCtx, action, internalAction } from "./_generated/server.js"

export const createImage = action({
	args: {
		name: v.string(),
		storageId: v.id("_storage"),
	},
	async handler(ctx, args): Promise<Id<"images">> {
		const blob = await ctx.storage.get(args.storageId)
		if (!blob) {
			throw new Error(`Image not found in storage: ${args.storageId}`)
		}
		return await createImageFromBlob(ctx, args.name, blob)
	},
})

export const createImageFromUrl = internalAction({
	args: {
		name: v.string(),
		url: v.string(),
	},
	async handler(ctx, args): Promise<Id<"images">> {
		const response = await fetch(args.url)
		return await createImageFromBlob(ctx, args.name, await response.blob())
	},
})

export const setUserImageFromDiscord = internalAction({
	args: {
		userId: v.id("users"),
		name: v.string(),
		discordUserId: v.string(),
		discordImageSnowflake: v.string(),
	},
	async handler(ctx, args) {
		const image = await createImageFromUrl(ctx, {
			name: `avatar_${args.name}`,
			url: `https://cdn.discordapp.com/avatars/${args.discordUserId}/${args.discordImageSnowflake}.webp`,
		})
		await ctx.runMutation(internal.users.update, {
			id: args.userId,
			image,
		})
	},
})

export const setCharacterImageFromStorage = internalAction({
	args: {
		storageId: v.id("_storage"),
		characterId: v.id("characters"),
	},
	async handler(ctx, args) {
		const blob = await ctx.storage.get(args.storageId)
		if (!blob) {
			throw new Error(`Image not found in storage: ${args.storageId}`)
		}
		const id = await createImageFromBlob(ctx, `character_${args.characterId}`, blob)
		await ctx.runMutation(internal.characters.functions.updateInternal, {
			id: args.characterId,
			image: id,
		})
	},
})

async function createImageFromBlob(ctx: ActionCtx, name: string, blob: Blob) {
	const log = (...values: unknown[]) => console.info(`[image ${name}]\n->`, ...values)

	const buffer = await blob.arrayBuffer()
	const hash = createHash("sha256").update(new Uint8Array(buffer)).digest("hex")
	const existing = await ctx.runQuery(internal.images.getByHash, { hash })

	if (existing) {
		log("Found existing image", existing._id)
		await ctx.runMutation(internal.images.update, {
			id: existing._id,
			name,
		})
		return existing._id
	}

	const image = sharp(buffer).toFormat("webp", { lossless: true })
	const metadata = await image.metadata()

	const { width, height } = metadata
	if (!width || !height) {
		const errorData = {
			name,
			metadata,
		}
		throw new Error(`Invalid image dimensions. ${JSON.stringify(errorData, null, 2)}`)
	}

	const sizes = await Promise.all(
		[64, 256, 500, 1000]
			.filter((size) => size <= width && size <= height)
			.map(async (size) => {
				log(`Resizing to ${size}x${size}`)
				const buffer = await image
					.clone()
					.resize(size, size, { fit: "inside" })
					.toFormat("webp", { lossless: true })
					.toBuffer()

				const scale = size / Math.max(width, height)
				const newWidth = Math.round(width * scale)
				const newHeight = Math.round(height * scale)

				log(`Storing resized image`)
				const storageId = await ctx.storage.store(new Blob([buffer], { type: "image/webp" }))

				return { width: newWidth, height: newHeight, storageId }
			}),
	)

	log(`Finished`)

	return await ctx.runMutation(internal.images.create, {
		name,
		hash,
		sizes: [
			...sizes,
			{
				width,
				height,
				storageId: await ctx.storage.store(blob),
			},
		],
	})
}
