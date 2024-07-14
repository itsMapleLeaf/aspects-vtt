import { literals } from "convex-helpers/validators"
import { v, type Infer } from "convex/values"
import { listAttributeIds } from "../../app/modules/attributes/data.ts"
import { userColorValidator } from "../types.ts"

export const characterAttributeValidator = literals(...listAttributeIds())

export function characterConditionValidator() {
	return v.object({
		name: v.string(),
		color: userColorValidator(),
	})
}
export type ApiCharacterCondition = Infer<ReturnType<typeof characterConditionValidator>>
