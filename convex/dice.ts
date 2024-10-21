import { v, type Infer } from "convex/values"

export type DiceRollInput = Infer<typeof diceRollInputValidator>
export const diceRollInputValidator = v.object({
	faces: v.number(),
	color: v.optional(v.string()),
	operation: v.optional(v.union(v.literal("subtract"))),
})

export type DiceRollResult = Infer<typeof diceRollResultValidator>
export const diceRollResultValidator = v.object({
	...diceRollInputValidator.fields,
	result: v.number(),
})
