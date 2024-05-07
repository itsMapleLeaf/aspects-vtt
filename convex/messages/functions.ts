import { paginationOptsValidator } from "convex/server"
import { ConvexError, type Infer, v } from "convex/values"
import { Effect } from "effect"
import { expect } from "../../app/common/expect.ts"
import { pick } from "../../app/common/object.ts"
import { range } from "../../app/common/range.ts"
import { mutation, query } from "../_generated/server.js"
import { getUserFromClerkId, getUserFromIdentity } from "../auth/helpers.ts"
import { CharacterModel } from "../characters/CharacterModel.js"
import { QueryCtxService } from "../helpers/effect.js"

export const diceRollValidator = v.object({
	dice: v.array(v.object({ key: v.string(), name: v.string(), result: v.number() })),
})

export const list = query({
	args: {
		roomId: v.id("rooms"),
		paginationOpts: paginationOptsValidator,
	},
	async handler(ctx, args) {
		const result = await ctx.db
			.query("messages")
			.withIndex("by_room", (q) => q.eq("roomId", args.roomId))
			.order("desc")
			.paginate(args.paginationOpts)

		return {
			...result,
			page: await Promise.all(
				result.page.map(async ({ userId, ...message }) => {
					const user = await Effect.runPromise(
						getUserFromClerkId(userId).pipe(
							Effect.provideService(QueryCtxService, ctx),
							Effect.tapError(Effect.logWarning),
							Effect.orElseSucceed(() => null),
						),
					)
					const { value: character } = await CharacterModel.fromPlayerId(ctx, userId)
					const data = await character?.getComputedData()
					return {
						...message,
						user: user && {
							...pick(user, ["name", "avatarUrl"]),
							character: data && pick(data, ["displayName", "displayPronouns"]),
						},
					}
				}),
			),
		}
	},
})

export const diceInputValidator = v.object({
	name: v.string(),
	sides: v.number(),
	count: v.number(),
	explodes: v.boolean(),
})

export type DiceInput = Infer<typeof diceInputValidator>

export const create = mutation({
	args: {
		roomId: v.id("rooms"),
		content: v.optional(v.string()),
		dice: v.optional(v.array(diceInputValidator)),
	},
	async handler(ctx, { dice = [], content = "", ...args }) {
		const user = await getUserFromIdentity(ctx).getValueOrThrow()
		const diceInputCount = dice.reduce((total, input) => total + input.count, 0)

		if (content.trim() === "" && diceInputCount === 0) {
			throw new ConvexError("Message cannot be empty.")
		}

		const diceRolls: Infer<typeof diceRollValidator>["dice"] = []

		const addDiceRoll = (name: string, sides: number, explodes: boolean) => {
			const result = getRandomNumber(sides)
			diceRolls.push({ key: crypto.randomUUID(), name, result })
			if (explodes && result === sides) {
				addDiceRoll(name, sides, explodes)
			}
		}

		for (const input of dice) {
			for (const _ of range(input.count)) {
				addDiceRoll(input.name, input.sides, input.explodes)
			}
		}

		const message = {
			...args,
			content,
			userId: user.clerkId,
			diceRoll: diceRolls.length > 0 ? { dice: diceRolls } : undefined,
		}
		await ctx.db.insert("messages", message)
		return message
	},
})

export const remove = mutation({
	args: {
		id: v.id("messages"),
	},
	async handler(ctx, { id }) {
		const user = await getUserFromIdentity(ctx).getValueOrThrow()

		const message = await ctx.db.get(id)
		if (!message) return

		if (message.userId !== user.clerkId) {
			throw new ConvexError("You don't have permission to do that.")
		}

		await ctx.db.delete(id)
	},
})

const getRandomNumber = (() => {
	const output = new Uint32Array(1)
	return function getRandomNumber(max: number) {
		crypto.getRandomValues(output)
		return (expect(output[0], "what") % max) + 1
	}
})()
