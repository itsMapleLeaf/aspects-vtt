import { FunctionReturnType } from "convex/server"
import { api } from "~/convex/_generated/api.js"

export type Room = NonNullable<
	FunctionReturnType<typeof api.entities.rooms.getBySlug>
>

export type Scene = NonNullable<
	FunctionReturnType<typeof api.entities.scenes.list>
>[number]

export type Character = NonNullable<
	FunctionReturnType<typeof api.entities.characters.list>
>[number]
