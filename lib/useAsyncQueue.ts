import { useState } from "react"

export function useAsyncQueue<Result, Args>(callback: (args: Args) => Result) {
	const [queue, setQueue] = useState(new Map<symbol, { args: Args }>())
	const pending = queue.size > 0

	async function run(args: Args) {
		const token = Symbol()
		setQueue((runs) => new Map(runs).set(token, { args }))
		try {
			return await callback(args)
		} finally {
			setQueue((runs) => {
				const next = new Map(runs)
				next.delete(token)
				return next
			})
		}
	}

	run.queue = [...queue.values()]
	run.pending = pending

	return run
}
