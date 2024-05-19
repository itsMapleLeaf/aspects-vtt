import { literals } from "convex-helpers/validators"
import { getColorNames } from "../shared/colors.ts"

export function userColorValidator() {
	return literals(...getColorNames())
}
