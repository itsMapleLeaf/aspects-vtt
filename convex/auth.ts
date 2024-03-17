import { v } from "convex/values"
import { argon2id } from "hash-wasm"
import { internal } from "./_generated/api.js"
import { action } from "./_generated/server.js"

type ResultTuple<T> = [data: T, error: null] | [data: null, error: string]

const successResult = <T>(data: T): ResultTuple<T> => [data, null]
const errorResult = <T = never>(error: string): ResultTuple<T> => [null, error]

export const register = action({
	args: {
		username: v.string(),
		password: v.string(),
	},
	async handler(ctx, args): Promise<ResultTuple<{ sessionId: string }>> {
		const existingUser = await ctx.runQuery(internal.users.getByUsername, {
			username: args.username,
		})
		if (existingUser) {
			return errorResult("Username already taken")
		}

		const passwordHash = await argon2id({
			password: args.password,
			salt: crypto.getRandomValues(new Uint8Array(16)),
			parallelism: 1,
			iterations: 256,
			memorySize: 512,
			hashLength: 32,
		})

		const userId = await ctx.runMutation(internal.users.create, {
			username: args.username,
			passwordHash,
		})
		const sessionId = await ctx.runMutation(internal.sessions.create, { userId })
		return successResult({ sessionId })
	},
})
