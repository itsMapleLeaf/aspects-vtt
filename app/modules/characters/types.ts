import type { FunctionArgs, FunctionReturnType } from "convex/server"
import type { api } from "../../../convex/_generated/api.js"
import type { PickByValue } from "../../helpers/types.js"

export type ApiCharacter = FunctionReturnType<typeof api.characters.functions.list>[number]

/**
 * A field on the character document which also can be updated, so it excludes computed fields, like
 * damage thresholds
 */
export type UpdateableCharacterField<ValueType> = Extract<
	keyof PickByValue<ApiCharacter, ValueType | undefined>,
	keyof FunctionArgs<typeof api.characters.functions.update>
>
