import { brandedString } from "convex-helpers/validators"
import { v } from "convex/values"

export const characterAspectSkillProperties = {
	characterId: v.id("characters"),
	aspectSkillId: brandedString("aspectSkill"),
}
