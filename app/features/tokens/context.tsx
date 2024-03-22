import { createContext } from "react"

export const ZoomContext = createContext(1)
export const ViewportElementContext = createContext<HTMLElement | null | undefined>(undefined)
