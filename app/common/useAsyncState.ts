import { useRef, useState } from "react"

export type AsyncState<Args, Return> = Readonly<
	| { status: "initial"; args?: never; data?: never; error?: never }
	| { status: "pending"; args: Args; data?: never; error?: never }
	| { status: "success"; args?: never; data: Awaited<Return>; error?: never }
	| { status: "error"; args?: never; data?: never; error: Error }
>

export function useAsyncState<Args, Return>(fn: (args: Args) => Return) {
	const [state, setState] = useState<AsyncState<Args, Return>>({ status: "initial" })
	const abortControllerRef = useRef<AbortController>()

	async function run(args: Args) {
		abortControllerRef.current?.abort()

		const controller = (abortControllerRef.current = new AbortController())
		setState({ status: "pending", args })

		try {
			const data = await fn(args)
			if (!controller.signal.aborted) {
				setState({ status: "success", data })
			}
		} catch (error) {
			if (!controller.signal.aborted) {
				setState({ status: "error", error: new Error(undefined, { cause: error }) })
			}
		}
	}

	return [state, run] as const
}
