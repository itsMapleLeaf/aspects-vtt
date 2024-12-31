import { useEffect, useRef, useState } from "react"

export const INITIAL_PENDING_DELAY = 300
export const MINIMUM_PENDING_DURATION = 500

export function usePendingDelay(input: boolean) {
	const [output, setOutput] = useState(input)
	const pendingStartTime = useRef(0)

	useEffect(() => {
		// go from not pending to pending after a delay
		if (input === true) {
			return timeoutEffect(INITIAL_PENDING_DELAY, () => {
				setOutput(true)
				pendingStartTime.current = Date.now()
			})
		}
		// pending state should last at least 500ms
		if (input === false) {
			const delay = Math.max(
				0,
				pendingStartTime.current + MINIMUM_PENDING_DURATION - Date.now(),
			)
			return timeoutEffect(delay, () => {
				setOutput(false)
			})
		}
	}, [input])

	return output
}

function timeoutEffect(delay: number, callback: () => void) {
	const id = setTimeout(callback, delay)
	return () => clearTimeout(id)
}
