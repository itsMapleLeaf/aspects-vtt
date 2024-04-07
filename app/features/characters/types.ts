import type { FunctionReturnType } from "convex/server"
import type { api } from "#convex/_generated/api.js"

export type Character = FunctionReturnType<typeof api.characters.list>[number]