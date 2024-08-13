import { mapValues } from "~/helpers/object.ts"
import type { ValueOf } from "~/helpers/types.ts"
import { titleCase } from "../../helpers/string.ts"
import { getAspect } from "../aspects/data.ts"

const attributes = mapValues(
	{
		strength: {
			description: "Physical force and resilience.",
			aspect: "fire" as const,
		},
		sense: {
			description:
				"Perception, environmental awareness, focus, mental resilience.",
			aspect: "water" as const,
		},
		mobility: {
			description: "Speed, agility, reflexes, reaction time.",
			aspect: "wind" as const,
		},
		intellect: {
			description: "Book knowledge, problem-solving, and memory.",
			aspect: "light" as const,
		},
		wit: {
			description: "Social aptitude, cunning, intimidation.",
			aspect: "darkness" as const,
		},
	},
	(value, id) => ({
		id,
		name: titleCase(id),
		description: value.description,
		get aspect() {
			return getAspect(value.aspect)
		},
	}),
)

export type Attribute = ValueOf<typeof attributes>

export function getAttribute(id: Attribute["id"]) {
	return attributes[id]
}

export function listAttributes() {
	return Object.values(attributes)
}

export function listAttributeIds() {
	return Object.keys(attributes) as Array<Attribute["id"]>
}
