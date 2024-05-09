import { brandedString } from "convex-helpers/validators"
import { type Infer, v } from "convex/values"

export const attributeIdValidator = brandedString("attributes")
export type AttributeId = Infer<typeof attributeIdValidator>

export const notionImportProperties = {
	attributes: v.array(
		v.object({
			id: attributeIdValidator,
			name: v.string(),
			description: v.string(),
			key: v.union(
				v.literal("strength"),
				v.literal("sense"),
				v.literal("mobility"),
				v.literal("intellect"),
				v.literal("wit"),
			),
		}),
	),
	races: v.array(
		v.object({
			id: brandedString("races"),
			name: v.string(),
			description: v.string(),
			abilities: v.array(
				v.object({
					name: v.string(),
					description: v.string(),
				}),
			),
		}),
	),
	aspects: v.array(
		v.object({
			id: brandedString("aspects"),
			name: v.string(),
			description: v.string(),
			ability: v.object({
				name: v.string(),
				description: v.string(),
			}),
		}),
	),
	generalSkills: v.array(
		v.object({
			id: brandedString("generalSkills"),
			name: v.string(),
			description: v.string(),
		}),
	),
	aspectSkills: v.array(
		v.object({
			id: brandedString("aspectSkills"),
			name: v.string(),
			description: v.string(),
			aspects: v.array(brandedString("aspectName")),
		}),
	),
}
