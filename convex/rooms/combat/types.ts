import { deprecated, nullable } from "convex-helpers/validators"
import { type Infer, v } from "convex/values"
import { attributeIdValidator } from "../../notionImports/types.ts"

export const memberValidator = v.object({
	characterId: v.id("characters"),
	initiative: nullable(v.number()),
})
export type CombatMember = Infer<typeof memberValidator>

export const roomCombatValidator = v.object({
	currentMemberId: v.optional(nullable(v.id("characters"))),
	currentRoundNumber: v.number(),
	initiativeAttribute: nullable(attributeIdValidator),
	memberObjects: v.optional(v.array(memberValidator)),
	currentMemberIndex: deprecated,
	members: deprecated,
})
