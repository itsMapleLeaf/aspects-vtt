import { keys } from "../app/common/object.ts"
import { titleCase } from "../app/common/string.ts"
import { getAttribute, type Attribute } from "./attributes.ts"

const aspectData = {
	fire: {
		// description: import("./aspects/fire.md?raw"),
		attribute: "strength",
	},
	water: {
		// description: import("./aspects/water.md?raw"),
		attribute: "sense",
	},
	wind: {
		// description: import("./aspects/wind.md?raw"),
		attribute: "mobility",
	},
	light: {
		// description: import("./aspects/light.md?raw"),
		attribute: "intellect",
	},
	darkness: {
		// description: import("./aspects/darkness.md?raw"),
		attribute: "wit",
	},
} as const satisfies Record<
	string,
	{
		// description: Promise<{ default: string }>
		attribute: string
	}
>

export interface Aspect {
	readonly id: keyof typeof aspectData
	readonly name: string
	// readonly document: Promise<{ default: string }>
	get attribute(): Attribute
}

export function getAspect(id: Aspect["id"]): Aspect {
	return {
		id,
		name: titleCase(id),
		// document: aspectData[id].description,
		get attribute() {
			return getAttribute(aspectData[id].attribute)
		},
	}
}

export function listAspects() {
	return keys(aspectData).map(getAspect)
}

export function listAspectNames() {
	return keys(aspectData)
}
