import { useMutation } from "convex/react"
import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server"
import { useRef, useState } from "react"

export function useMutationState<Fn extends FunctionReference<"mutation">>(query: Fn) {
	const [state, setState] = useState<
		| { status: "initial"; args?: never; data?: never; error?: never }
		| { status: "pending"; args: FunctionArgs<Fn>; data?: never; error?: never }
		| { status: "success"; args?: never; data: FunctionReturnType<Fn>; error?: never }
		| { status: "error"; args?: never; data?: never; error: unknown }
	>({ status: "initial" })

	const mutate = useMutation(query)
	const mutationToken = useRef<symbol>()

	function runMutation(args: FunctionArgs<Fn>) {
		const token = (mutationToken.current = Symbol())
		setState({ status: "pending", args })
		mutate(args)
			.then((data) => {
				if (token !== mutationToken.current) return
				setState({ status: "success", data })
			})
			.catch((error: unknown) => {
				if (token !== mutationToken.current) return
				setState({ status: "error", error })
			})
	}

	return [state, runMutation] as const
}
