import { useEffect } from "react"
import { bindWindowEvent } from "./dom"

export function useWindowEvent<K extends keyof WindowEventMap>(
	eventType: K,
	handler: (event: WindowEventMap[K]) => void,
	options?: AddEventListenerOptions,
) {
	useEffect(() => bindWindowEvent<K>(eventType, handler, options))
}
