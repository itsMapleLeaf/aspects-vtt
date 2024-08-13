import { useEffect } from "react"

export function bindWindowEvent<K extends keyof WindowEventMap>(
	eventType: K,
	handler: (event: WindowEventMap[K]) => void,
	options?: AddEventListenerOptions,
) {
	window.addEventListener(eventType, handler, options)
	return () => {
		window.removeEventListener(eventType, handler, options)
	}
}

export function useWindowEvent<K extends keyof WindowEventMap>(
	eventType: K,
	handler: (event: WindowEventMap[K]) => void,
	options?: AddEventListenerOptions,
) {
	useEffect(() => bindWindowEvent<K>(eventType, handler, options))
}
