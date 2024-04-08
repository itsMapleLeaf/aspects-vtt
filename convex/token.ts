import { type Infer, v } from "convex/values"

export const tokenValidator = v.object({
	position: v.object({ x: v.number(), y: v.number() }),
	visible: v.boolean(),
})

export type Token = Infer<typeof tokenValidator>
