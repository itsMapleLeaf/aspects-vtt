import { useQuery } from "convex/react"
import type { FunctionReference, FunctionReturnType } from "convex/server"
import type { StrictOmit } from "#app/common/types.js"

const sessionKey = "session"

export function saveSession(sessionId: string) {
	window.localStorage.setItem(sessionKey, sessionId)
}

export function clearSession() {
	window.localStorage.removeItem(sessionKey)
}

export function useQueryWithSession<
	Query extends FunctionReference<"query", "public", { sessionId: string }>,
>(query: Query, args: StrictOmit<FunctionReturnType<Query>, "sessionId"> | "skip") {
	const sessionId = window.localStorage.getItem(sessionKey)
	if (!sessionId && args !== "skip") {
		throw new SessionError("Not logged in")
	}
	return useQuery(query, args === "skip" ? "skip" : { sessionId, ...args })
}

export class SessionError extends Error {}
