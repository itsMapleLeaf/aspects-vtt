import { useEffect } from "react"

export class Emitter<T = void> {
	#listeners = new Set<(value: T) => void>()

	on(listener: (value: T) => void) {
		this.#listeners.add(listener)
		return () => {
			this.#listeners.delete(listener)
		}
	}

	emit(value: T) {
		for (const listener of this.#listeners) {
			listener(value)
		}
	}
}

export function useListener<T>(emitter: Emitter<T>, listener: (value: T) => void) {
	useEffect(() => emitter.on(listener))
}
