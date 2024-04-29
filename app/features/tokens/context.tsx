import { createContext } from "react"
import { Vector } from "../../common/vector.ts"

export const ZoomContext = createContext(1)

export const OffsetContext = createContext(Vector.zero)
