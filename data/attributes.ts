import { keys } from "../app/common/object.ts"
import { titleCase } from "../app/common/string.ts"
import { getAspect, type Aspect } from "./aspects.ts"

const attributeData = {
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
} as const satisfies Record<
	string,
	{
		description: string
		aspect: string
	}
>

export interface Attribute {
	id: keyof typeof attributeData
	name: string
	description: string
	get aspect(): Aspect
}

export function getAttribute(id: Attribute["id"]): Attribute {
	return {
		id,
		name: titleCase(id),
		description: attributeData[id].description,
		get aspect() {
			return getAspect(attributeData[id].aspect)
		},
	}
}

export function listAttributes() {
	return keys(attributeData).map(getAttribute)
}

export function listAttributeIds() {
	return keys(attributeData)
}
