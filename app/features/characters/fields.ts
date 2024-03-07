import type { Simplify } from "~/common/types.ts"

type CharacterFieldBase<Type extends string, Value> = {
	key: string
	label: string
	type: Type
	fallback: Value
}

export type CharacterField = Simplify<
	| (CharacterFieldBase<"text", string> & { multiline?: boolean })
	| CharacterFieldBase<"image", string | undefined>
	| (CharacterFieldBase<"counter", number> & { hasMax?: boolean })
	| CharacterFieldBase<"die", 4 | 6 | 8 | 12 | 20>
>

export const CharacterFields: readonly CharacterField[] = [
	{ key: "Name", label: "Name", type: "text", fallback: "" },
	{ key: "Gender", label: "Gender", type: "text", fallback: "" },
	{ key: "Pronouns", label: "Pronouns", type: "text", fallback: "" },
	{ key: "Image", label: "Image", type: "image", fallback: undefined },

	{ key: "Strength", label: "Strength", type: "die", fallback: 4 },
	{ key: "Sense", label: "Sense", type: "die", fallback: 4 },
	{ key: "Mobility", label: "Mobility", type: "die", fallback: 4 },
	{ key: "Intellect", label: "Intellect", type: "die", fallback: 4 },
	{ key: "Wit", label: "Wit", type: "die", fallback: 4 },

	{ key: "Health", label: "Health", type: "counter", fallback: 0, hasMax: true },
	{ key: "Fatigue", label: "Fatigue", type: "counter", fallback: 0 },
	{ key: "Notes", label: "Notes", type: "counter", fallback: 100 },
	{ key: "Skills", label: "Skills", type: "text", fallback: "", multiline: true },

	{ key: "Homeland", label: "Homeland", type: "text", fallback: "" },
	{ key: "Race", label: "Race", type: "text", fallback: "" },
	{ key: "Experience", label: "Experience", type: "counter", fallback: 0 },
	{ key: "Items", label: "Items", type: "text", fallback: "", multiline: true },
	{ key: "Profile", label: "Profile", type: "text", fallback: "", multiline: true },
]

export const CharacterFieldsByKey: ReadonlyMap<CharacterField["key"], CharacterField> = new Map(
	CharacterFields.map((field) => [field.key, field]),
)
