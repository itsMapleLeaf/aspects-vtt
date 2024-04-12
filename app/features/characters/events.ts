import { Emitter } from "#app/common/emitter.js"
import type { Id } from "#convex/_generated/dataModel.js"

export const selectCharacterEvent = new Emitter<Id<"characters">>()
