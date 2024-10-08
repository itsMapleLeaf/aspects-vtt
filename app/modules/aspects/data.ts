import { SafeMap, type SafeMapValue } from "../../../common/SafeMap.ts"
import { titleCase } from "../../../common/string.ts"
import { getAttribute } from "../attributes/data.ts"

export const Aspects = SafeMap.mapRecord(
	{
		fire: {
			attribute: "strength",
		},
		water: {
			attribute: "sense",
		},
		wind: {
			attribute: "mobility",
		},
		light: {
			attribute: "intellect",
		},
		darkness: {
			attribute: "wit",
		},
	},
	(value, id) => ({
		id,
		name: titleCase(id),
		// description: aspectData[id].description,
		get attribute() {
			return getAttribute(value.attribute)
		},
	}),
)

export type Aspect = SafeMapValue<typeof Aspects>

export const getAspect = Aspects.get.bind(Aspects)
export const listAspects = Aspects.values.bind(Aspects)
export const listAspectNames = Aspects.keys.bind(Aspects)
