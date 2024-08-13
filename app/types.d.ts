import {} from "@total-typescript/ts-reset"
import {} from "vite/client"

import "react"
declare module "react" {
	export function useActionState<State, Payload>(
		action: (state: Awaited<State>, payload: Payload) => State | Promise<State>,
	): [
		state: Awaited<State>,
		dispatch: (payload: Payload) => void,
		isPending: boolean,
	]
}
