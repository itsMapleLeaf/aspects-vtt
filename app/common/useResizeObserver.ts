import { useEffect, useRef, useState } from "react"
import { expect } from "./expect.ts"
import type { Nullish } from "./types.ts"
import { Vector } from "./vector.ts"

export function useResizeObserver(
	ref: Nullish<Element> | React.RefObject<Nullish<Element>>,
	callback: (entry: ResizeObserverEntry) => void,
) {
	const callbackRef = useRef<typeof callback>(undefined)
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

export function useSize(ref: Nullish<Element> | React.RefObject<Nullish<Element>>) {
	const [size, setSize] = useState(Vector.zero)
	useResizeObserver(ref, (entry) => setSize(Vector.fromSize(entry.contentRect)))
	return size
}
