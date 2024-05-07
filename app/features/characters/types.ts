import type { FunctionReturnType } from "convex/server"
import type { api } from "../../../convex/_generated/api.js"

export type ApiCharacter = FunctionReturnType<typeof api.characters.functions.list>[number]

export type ApiAttribute = NonNullable<
	FunctionReturnType<typeof api.notionImports.functions.get>
>["attributes"][number]
