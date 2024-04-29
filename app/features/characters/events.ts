import type { Id } from "../../../convex/_generated/dataModel.js"
import { Emitter } from "../../common/emitter.ts"

export const editCharacterEvent = new Emitter<Id<"characters">>()
