import { z } from "zod"
import type { Id } from "../../../convex/_generated/dataModel"
import type { Doc } from "../../../convex/_generated/dataModel.js"

export type ApiScene = Doc<"scenes">

export const sceneResourceSchema = z.object({
	sceneId: z.custom<Id<"scenes">>((input) => typeof input === "string"),
})
export type SceneResourceData = z.infer<typeof sceneResourceSchema>
