import { useEffect, useState } from "react"
import { useEffectEvent } from "./react/core.ts"

export type MaybeRef<T> =
	| T
	| null
	| undefined
	| React.RefObject<T | null | undefined>

function unwrapRef(targetRef: MaybeRef<EventTarget>) {
	return targetRef == null
		? null
		: "current" in targetRef
			? targetRef.current
			: targetRef
}

function useEventListener(
	targetRef: MaybeRef<EventTarget>,
	event: string,
	listener: (event: Event) => void,
	options?: AddEventListenerOptions,
) {
	const callback = useEffectEvent((event: Event) => {
		listener(event)
	})
	useEffect(() => {
		const target = unwrapRef(targetRef)
		if (!target) return

		target.addEventListener(event, callback, options)
		return () => target.removeEventListener(event, callback, options)
	})
}

export function useWindowEvent<E extends keyof WindowEventMap>(
	event: E,
	listener: (event: WindowEventMap[E]) => void,
	options?: AddEventListenerOptions,
) {
	return useEventListener(
		window,
		event,
		listener as (event: Event) => void,
		options,
	)
}

export function useDocumentEvent<E extends keyof DocumentEventMap>(
	event: E,
	listener: (event: DocumentEventMap[E]) => void,
	options?: AddEventListenerOptions,
) {
	return useEventListener(
		document,
		event,
		listener as (event: Event) => void,
		options,
	)
}

export function useHtmlElementEvent<E extends keyof HTMLElementEventMap>(
	target: MaybeRef<HTMLElement>,
	event: E,
	listener: (event: HTMLElementEventMap[E]) => void,
	options?: AddEventListenerOptions,
) {
	return useEventListener(
		target,
		event,
		listener as (event: Event) => void,
		options,
	)
}

export function useElementEvent<E extends keyof ElementEventMap>(
	target: MaybeRef<Element>,
	event: E,
	listener: (event: ElementEventMap[E]) => void,
	options?: AddEventListenerOptions,
) {
	return useEventListener(
		target,
		event,
		listener as (event: Event) => void,
		options,
	)
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
