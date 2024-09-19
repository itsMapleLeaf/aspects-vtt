import type { FunctionReturnType } from "convex/server"
import type { api } from "~/convex/_generated/api.js"

export type ApiRoom = NonNullable<
	FunctionReturnType<typeof api.entities.rooms.getBySlug>
>
