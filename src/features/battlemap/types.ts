import { FunctionReturnType } from "convex/server"
import { api } from "~/convex/_generated/api.js"

export type ApiToken = NonNullable<
	FunctionReturnType<typeof api.tokens.list>[number]
>
