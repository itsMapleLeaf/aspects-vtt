import { useEffect, useRef, useState } from "react"
import { expect } from "#app/common/expect.ts"
import type { Nullish } from "#app/common/types.ts"
import { Vector } from "./vector.ts"

export function useResizeObserver(
	ref: Nullish<React.RefObject<Nullish<Element>> | Element>,
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

export function useSize(ref: Nullish<React.RefObject<Element> | Element>) {
	const [size, setSize] = useState(Vector.zero)
	useResizeObserver(ref, (entry) => setSize(Vector.fromSize(entry.contentRect)))
	return size
}
