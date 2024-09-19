import type { FunctionReturnType } from "convex/server"
import type { api } from "~/convex/_generated/api.js"

export type ApiCharacter = NonNullable<
	FunctionReturnType<typeof api.entities.characters.list>
>[number]
