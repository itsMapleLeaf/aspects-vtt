import { startCase } from "lodash-es"

export class Aspect {
	name: string
	description: string

	constructor(readonly id: keyof typeof Aspect.DATA) {
		this.name = startCase(id)
		this.description = Aspect.DATA[id].description
	}

	private static readonly DATA = {
		fire: {
			description: "flame, heat, and lightning",
		},
		water: {
			description: "water, vapor, ice, and cold",
		},
		wind: {
			description: "air, wind, and weather",
		},
		light: {
			description: "healing, buffs, and physical light",
		},
		darkness: {
			description: "flame, heat, and lightning",
		},
	} satisfies Record<string, { description: string }>
}
