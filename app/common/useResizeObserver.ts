import { useEffect, useRef } from "react"
import { expect } from "#app/common/expect.ts"
import type { Nullish } from "#app/common/types.ts"

export function useResizeObserver(
	ref: Nullish<React.RefObject<Element> | Element>,
	callback: (entry: ResizeObserverEntry) => void,
) {
	const callbackRef = useRef<typeof callback>()
	useEffect(() => {
		callbackRef.current = callback
	})

	useEffect(() => {
		const element = ref && "current" in ref ? ref.current : ref
		if (!element) return

		const observer = new ResizeObserver((entries) => {
			callbackRef.current?.(expect(entries[0], "resize observer entry not found"))
		})
		observer.observe(element)
		return () => observer.disconnect()
	}, [ref])
}
