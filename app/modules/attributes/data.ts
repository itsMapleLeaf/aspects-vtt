import { SafeMap, type SafeMapValue } from "../../helpers/SafeMap.ts"
import { titleCase } from "../../helpers/string.ts"
import { getAspect } from "../aspects/data.ts"

export const Attributes = SafeMap.mapRecord(
	{
		strength: {
			description: "Physical force and resilience.",
			aspect: "fire",
		},
		sense: {
			description: "Perception, environmental awareness, focus, mental resilience.",
			aspect: "water",
		},
		mobility: {
			description: "Speed, agility, reflexes, reaction time.",
			aspect: "wind",
		},
		intellect: {
			description: "Book knowledge, problem-solving, and memory.",
			aspect: "light",
		},
		wit: {
			description: "Social aptitude, cunning, intimidation.",
			aspect: "darkness",
		},
	},
	({ aspect, description }, id) => ({
		id,
		name: titleCase(id),
		description,
		get aspect() {
			return getAspect(aspect)
		},
	}),
)

export type Attribute = SafeMapValue<typeof Attributes>

export const getAttribute = Attributes.get.bind(Attributes)
export const listAttributes = Attributes.values.bind(Attributes)
export const listAttributeIds = Attributes.keys.bind(Attributes)
