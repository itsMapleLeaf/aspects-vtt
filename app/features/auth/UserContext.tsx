import { createContext } from "react"
import type { Doc } from "../../../convex/_generated/dataModel"

export const UserContext = createContext<Promise<Doc<"users">> | null>(null)
