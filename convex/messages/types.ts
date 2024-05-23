import { type Infer, v } from "convex/values"

export type DiceRoll = Infer<typeof diceRollValidator>
export const diceRollValidator = v.object({
	key: v.string(),
	name: v.string(),
	result: v.number(),
})

export type DiceInput = Infer<typeof diceInputValidator>
export const diceInputValidator = v.object({
	name: v.string(),
	sides: v.number(),
	count: v.number(),
	explodes: v.boolean(),
})
