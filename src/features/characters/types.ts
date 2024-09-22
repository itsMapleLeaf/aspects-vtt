import type { FunctionReturnType } from "convex/server"
import type { api } from "~/convex/_generated/api.js"
import type { NormalizedCharacter } from "~/convex/characters.ts"

export type ApiCharacter = NonNullable<
	FunctionReturnType<typeof api.characters.get>
>

export type CharacterAttributeName = keyof NormalizedCharacter["attributes"]
