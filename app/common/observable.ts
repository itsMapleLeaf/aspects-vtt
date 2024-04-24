import * as React from "react"

export class Observable<T> {
	#value: T
	#subscribers = new Set<(value: T) => void>()

	private constructor(value: T) {
		this.#value = value
	}

	static of<T>(value: T) {
		return new Observable(value)
	}

	static empty<T>() {
		return new Observable<T | undefined>(undefined)
	}

	get value() {
		return this.#value
	}

	set(value: T) {
		this.#value = value
		for (const callback of this.#subscribers) {
			callback(value)
		}
	}

	subscribe(callback: (value: T) => void) {
		this.#subscribers.add(callback)
		callback(this.#value)
		return () => {
			this.#subscribers.delete(callback)
		}
	}
}

export function useObservable<T>(observable: Observable<T>) {
	return React.useSyncExternalStore(
		(onChange) => observable.subscribe(onChange),
		() => observable.value,
		() => observable.value,
	)
}
