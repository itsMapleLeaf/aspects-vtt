import { type Infer, v } from "convex/values"

export const diceRollValidator = v.object({
	dice: v.array(v.object({ key: v.string(), name: v.string(), result: v.number() })),
})
export const diceInputValidator = v.object({
	name: v.string(),
	sides: v.number(),
	count: v.number(),
	explodes: v.boolean(),
})

export type DiceInput = Infer<typeof diceInputValidator>
