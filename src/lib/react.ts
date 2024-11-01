import { useEffect, useState } from "react"
import { useEffectEvent } from "~/common/react/core.ts"

export type MaybeRef<T> =
	| T
	| null
	| undefined
	| React.RefObject<T | null | undefined>

export function useEventListener<E extends keyof WindowEventMap>(
	target: MaybeRef<Window>,
	event: E,
	listener: (event: WindowEventMap[E]) => void,
	options?: AddEventListenerOptions,
): void
export function useEventListener<E extends keyof DocumentEventMap>(
	target: MaybeRef<Document>,
	event: E,
	listener: (event: DocumentEventMap[E]) => void,
	options?: AddEventListenerOptions,
): void
export function useEventListener<E extends keyof HTMLElementEventMap>(
	target: MaybeRef<HTMLElement>,
	event: E,
	listener: (event: HTMLElementEventMap[E]) => void,
	options?: AddEventListenerOptions,
): void
export function useEventListener<E extends keyof ElementEventMap>(
	target: MaybeRef<Element>,
	event: E,
	listener: (event: ElementEventMap[E]) => void,
	options?: AddEventListenerOptions,
): void
export function useEventListener(
	targetRef: MaybeRef<EventTarget>,
	event: string,
	listener: (event: Event) => void,
	options?: AddEventListenerOptions,
) {
	const callback = useEffectEvent((event: Event) => {
		listener(event)
	})
	useEffect(() => {
		const target =
			targetRef == null
				? null
				: "current" in targetRef
					? targetRef.current
					: targetRef

		if (!target) return

		target.addEventListener(event, callback, options)
		return () => target.removeEventListener(event, callback, options)
	})
}

export function useElementEmpty() {
	const [isEmpty, setIsEmpty] = useState(true)
	const [element, ref] = useState<ParentNode | null>(null)

	useEffect(() => {
		if (!element) return

		const observer = new MutationObserver((mutations) => {
			if (mutations.some((it) => it.type === "childList")) {
				setIsEmpty(element.children.length === 0)
			}
		})
		observer.observe(element, { childList: true })

		return () => {
			observer.disconnect()
		}
	}, [element])

	return [isEmpty, ref] as const
}
