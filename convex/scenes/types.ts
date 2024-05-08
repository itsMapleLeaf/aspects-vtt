import { deprecated, nullable } from "convex-helpers/validators"
import { v } from "convex/values"
import { sceneTokenProperties } from "./tokens/types"

export const sceneUpdateProperties = {
	name: v.string(),
	background: nullable(v.id("_storage")),
	backgroundDimensions: v.optional(v.object({ x: v.number(), y: v.number() })),
	cellSize: v.number(),
}

export const sceneProperties = {
	...sceneUpdateProperties,
	roomId: v.id("rooms"),
	tokens: v.optional(v.array(v.object(sceneTokenProperties))),
	characterTokens: deprecated,
}
