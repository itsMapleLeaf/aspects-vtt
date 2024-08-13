import type { FunctionArgs, FunctionReturnType } from "convex/server"
import { z } from "zod"
import type { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel.js"
import type { AllKeys, PickByValue } from "../../helpers/types.js"
import type { Attribute } from "../attributes/data.js"

export type ApiCharacter = FunctionReturnType<
	typeof api.characters.functions.list
>[number]
export type OwnedApiCharacter = Extract<ApiCharacter, { permission: "full" }>

/**
 * A field on the character document which also can be updated, so it excludes
 * computed fields, like damage thresholds
 */
export type UpdateableCharacterField<ValueType> = Extract<
	AllKeys<PickByValue<ApiCharacter, ValueType | undefined>>,
	keyof FunctionArgs<typeof api.characters.functions.update>
>

export type CharacterAttributeValues = Partial<Record<Attribute["id"], number>>

export const characterDragData = z.object({
	characterId: z.custom<Id<"characters">>((input) => typeof input === "string"),
	visible: z.optional(z.boolean()),
})
export type CharacterDragData = z.infer<typeof characterDragData>
