import type { FunctionReturnType } from "convex/server"
import type { api } from "#convex/_generated/api.js"

export type ApiCharacter = FunctionReturnType<typeof api.characters.list>[number]

export type ApiAttribute = NonNullable<
	FunctionReturnType<typeof api.notionImports.get>
>["attributes"][number]
