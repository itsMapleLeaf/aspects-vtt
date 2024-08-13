import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Vector } from "../Vector.ts"
import { unwrap } from "../errors.ts"
import type { Nullish } from "../types.ts"

export function useResizeObserver<T extends Element>(
	ref: Nullish<T> | React.RefObject<Nullish<T>>,
	callback: (size: { width: number; height: number }, element: T) => void,
) {
	const callbackRef = useRef<typeof callback>(undefined)
	useLayoutEffect(() => {
		callbackRef.current = callback
	})

	useLayoutEffect(() => {
		const element = ref && "current" in ref ? ref.current : ref
		if (element) {
			callbackRef.current?.(element.getBoundingClientRect(), element)
		}
	}, [ref])

	useEffect(() => {
		const element = ref && "current" in ref ? ref.current : ref
		if (!element) return

		const observer = new ResizeObserver((entries) => {
			const entry = unwrap(entries[0], "resize observer entry not found")
			callbackRef.current?.(entry.contentRect, element)
		})
		observer.observe(element)
		return () => observer.disconnect()
	}, [ref])
}

export function useSize(
	ref: Nullish<Element> | React.RefObject<Nullish<Element>>,
) {
	const [size, setSize] = useState(Vector.zero)
	useResizeObserver(ref, (size) => setSize(Vector.fromSize(size)))
	return size
}
