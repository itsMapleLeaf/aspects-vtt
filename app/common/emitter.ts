import { useEffect } from "react"

export type Listener<T> = (value: T) => void

export class Emitter<T = void> {
	#listeners = new Set<Listener<T>>()

	on(listener: Listener<T>) {
		this.#listeners.add(listener)
		return () => {
			this.#listeners.delete(listener)
		}
	}

	emit(value: T) {
		for (const listener of [...this.#listeners]) {
			// the listener might've been removed while running this loop
			if (this.#listeners.has(listener)) {
				listener(value)
			}
		}
	}
}

export function useListener<T>(emitter: Emitter<T>, listener: Listener<T>) {
	useEffect(() => emitter.on(listener))
}
