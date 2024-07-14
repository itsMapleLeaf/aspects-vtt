"use node"

import { v } from "convex/values"
import { createHash } from "node:crypto"
import sharp from "sharp"
import { internal } from "./_generated/api.js"
import type { Id } from "./_generated/dataModel.js"
import { internalAction } from "./_generated/server.js"

export const createImageFromUrl = internalAction({
	args: {
		name: v.string(),
		url: v.string(),
	},
	async handler(ctx, args): Promise<Id<"images">> {
		const log = (...values: unknown[]) =>
			console.info(`[image ${args.name} from ${args.url}]\n->`, ...values)

		const response = await fetch(args.url)
		const data = await response.arrayBuffer()
		log("Fetched image")

		const hash = createHash("sha256").update(new Uint8Array(data)).digest("hex")
		const existing = await ctx.runQuery(internal.images.getByHash, { hash })
		if (existing) {
			log("Found existing image", existing._id)
			await ctx.runMutation(internal.images.update, {
				id: existing._id,
				name: args.name,
			})
			return existing._id
		}

		const image = sharp(data).toFormat("webp", { lossless: true })
		log("Loaded image")
		const metadata = await image.metadata()
		log("Got image metadata", metadata)

		if (!metadata.width || !metadata.height) {
			const errorData = {
				url: args.url,
				name: args.name,
				metadata,
			}
			throw new Error(`Invalid image dimensions. ${JSON.stringify(errorData, null, 2)}`)
		}

		const sizes = []

		for (const size of [16, 64, 500, 1000]) {
			if (metadata.width <= size && metadata.height <= size) {
				log(`Skipping ${size}x${size} because it's already smaller than the image`)
				continue
			}

			const resized = await image
				.clone()
				.resize(size, size, { fit: "inside" })
				.toFormat("webp", { lossless: true })
				.toBuffer()
			log(`Resized to ${size}x${size}`)

			const storageId = await ctx.storage.store(new Blob([resized], { type: "image/webp" }))
			log(`Stored resized image`, storageId)

			sizes.push({ width: size, height: size, storageId })
		}

		return await ctx.runMutation(internal.images.create, {
			name: args.name,
			hash,
			sizes: [
				...sizes,
				{
					width: metadata.width,
					height: metadata.height,
					storageId: await ctx.storage.store(new Blob([data], { type: "image/webp" })),
				},
			],
		})
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
