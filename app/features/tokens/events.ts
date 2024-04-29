import type { Id } from "../../../convex/_generated/dataModel.js"
import { Emitter } from "../../common/emitter.ts"

export const tokenSelectedEvent = new Emitter<Id<"characters"> | Id<"rectangles">>()
