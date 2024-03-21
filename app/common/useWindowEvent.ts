import { useEffect } from "react"

export function useWindowEvent<K extends keyof WindowEventMap>(
	eventType: K,
	handler: (event: WindowEventMap[K]) => void,
	options?: AddEventListenerOptions,
) {
	useEffect(() => {
		window.addEventListener(eventType, handler, options)
		return () => {
			window.removeEventListener(eventType, handler, options)
		}
	})
}
