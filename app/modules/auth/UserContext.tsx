import * as React from "react"
import type { Doc } from "../../../convex/_generated/dataModel"

export const UserContext = React.createContext<Promise<Doc<"users"> | null>>(Promise.resolve(null))

export function useUser() {
	const userPromise = React.use(UserContext)
	return React.use(userPromise)
}
