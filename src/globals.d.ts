import "@remix-run/node"
import "@total-typescript/ts-reset"
import "@vitest/browser/providers/playwright.d.ts"
import "vite/client"

declare global {
	interface ImportMetaEnv {
		readonly VITE_CONVEX_URL: string
		readonly VITE_CONVEX_API_URL: string
	}
}

import "react"
declare module "react" {
	// an extra overload which accepts only one argument, using undefined as the default state
	export function useActionState<State, Payload>(
		action: (state: State, payload: Payload) => State | PromiseLike<State>,
	): [
		state: State | undefined,
		dispatch: (payload: Payload) => void,
		isPending: boolean,
	]
}
