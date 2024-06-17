import type { FunctionArgs, FunctionReturnType } from "convex/server"
import { Brand, Option } from "effect"
import type { api } from "../../../convex/_generated/api.js"
import type { PickByValue } from "../../common/types.js"

export type ApiCharacter = FunctionReturnType<typeof api.characters.functions.list>[number]

/**
 * A field on the character document which also can be updated, so it excludes computed fields, like
 * damage thresholds
 */
export type UpdateableCharacterField<ValueType> = Extract<
	keyof PickByValue<ApiCharacter, ValueType>,
	keyof FunctionArgs<typeof api.characters.functions.update>
>

export type OwnedCharacter = ApiCharacter & Brand.Brand<"OwnedCharacter">
export const OwnedCharacter = Brand.refined<OwnedCharacter>((character) =>
	character.isOwner ?
		Option.none()
	:	Option.some(Brand.error("Not an owned character", { character })),
)
