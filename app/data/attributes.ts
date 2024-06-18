import { SafeMap, type SafeMapValue } from "../lib/collections/SafeMap.ts"
import { titleCase } from "../lib/string.ts"
import { getAspect } from "./aspects.ts"

// const attributeData = {
// 	strength: {
// 		description: "Physical force and resilience.",
// 		aspect: "fire",
// 	},
// 	sense: {
// 		description: "Perception, environmental awareness, focus, mental resilience.",
// 		aspect: "water",
// 	},
// 	mobility: {
// 		description: "Speed, agility, reflexes, reaction time.",
// 		aspect: "wind",
// 	},
// 	intellect: {
// 		description: "Book knowledge, problem-solving, and memory.",
// 		aspect: "light",
// 	},
// 	wit: {
// 		description: "Social aptitude, cunning, intimidation.",
// 		aspect: "darkness",
// 	},
// } as const satisfies Record<
// 	string,
// 	{
// 		description: string
// 		aspect: string
// 	}
// >

// export interface Attribute {
// 	id: keyof typeof attributeData
// 	name: string
// 	description: string
// 	get aspect(): Aspect
// }

// export function getAttribute(id: Attribute["id"]): Attribute {
// 	return {
// 		id,
// 		name: titleCase(id),
// 		description: attributeData[id].description,
// 		get aspect() {
// 			return getAspect(attributeData[id].aspect)
// 		},
// 	}
// }

// export function listAttributes() {
// 	return keys(attributeData).map(getAttribute)
// }

// export function listAttributeIds() {
// 	return keys(attributeData)
// }

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
