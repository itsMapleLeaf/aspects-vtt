import { FunctionReturnType } from "convex/server"
import { api } from "~/convex/_generated/api.js"

export type ApiScene = FunctionReturnType<
	typeof api.entities.scenes.list
>[number]