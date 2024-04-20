import { Emitter } from "#app/common/emitter.js"
import type { Id } from "#convex/_generated/dataModel.js"

export const tokenSelectedEvent = new Emitter<Id<"characters"> | Id<"rectangles">>()
