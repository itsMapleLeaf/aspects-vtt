import { literals } from "convex-helpers/validators"
import { v } from "convex/values"
import { getColorNames } from "../shared/colors.ts"

export function userColorValidator() {
	return literals(...getColorNames())
}

export function vectorValidator() {
	return v.object({ x: v.number(), y: v.number() })
}
