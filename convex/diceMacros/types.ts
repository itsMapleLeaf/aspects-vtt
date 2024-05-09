import { v } from "convex/values"
import { diceInputValidator } from "../messages/types.ts"

export const diceMacroProperties = {
	name: v.string(),
	dice: v.array(diceInputValidator),
	roomId: v.id("rooms"),
}
