import { createContext } from "react"
import { Vector } from "#app/common/vector.js"

export const ZoomContext = createContext(1)

export const OffsetContext = createContext(Vector.zero)
