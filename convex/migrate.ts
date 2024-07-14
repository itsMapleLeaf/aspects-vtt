"use node"

import { createClerkClient } from "@clerk/remix/api.server"
import { omit } from "~/helpers/object.ts"
import { internal } from "./_generated/api.js"
import { action } from "./_generated/server.js"
import { createImageFromUrl } from "./images.node.ts"
import { getConvexSecret } from "./secrets.ts"

export const users = action({
	async handler(ctx) {
		const clerk = createClerkClient({
			secretKey: getConvexSecret("CLERK_SECRET_KEY"),
		})

		const failedUsers = []

		for (const user of await ctx.runQuery(internal.users.list, {})) {
			try {
				const clerkUser = await clerk.users.getUser(user.clerkId)

				const image = await createImageFromUrl(ctx, {
					name: `avatar_${user.clerkId}`,
					url: clerkUser.imageUrl,
				})

				await ctx.runMutation(internal.users.upsert, {
					...omit(user, ["_id", "_creationTime"]),
					email: clerkUser.emailAddresses.map((it) => it.emailAddress).find(Boolean),
					image,
				})
			} catch (error) {
				failedUsers.push({ user, error })
			}
		}

		if (failedUsers.length > 0) {
			console.info(`Failed to migrate ${failedUsers.length} users:`)
			for (const { user, error } of failedUsers) {
				console.info(`  ${user.clerkId} (${user.name})`, error)
			}
		}
	},
})
