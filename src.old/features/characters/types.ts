import { FunctionReturnType } from "convex/server"
import { api } from "../../../convex/_generated/api.js"

export type ApiCharacter = FunctionReturnType<
	typeof api.functions.characters.list
>[number]
