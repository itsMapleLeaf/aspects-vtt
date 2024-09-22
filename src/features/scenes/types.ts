import type { FunctionReturnType } from "convex/server"
import type { api } from "~/convex/_generated/api.js"

export type ApiScene = NonNullable<FunctionReturnType<typeof api.scenes.get>>
