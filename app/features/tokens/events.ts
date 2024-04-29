import { Emitter } from "../../common/emitter.ts"
import type { Id } from "../../../convex/_generated/dataModel.js"

export const tokenSelectedEvent = new Emitter<Id<"characters"> | Id<"rectangles">>()
