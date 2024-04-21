import React from "react"

export class Observable<T> {
	#value: T
	#subscribers = new Set<(value: T) => void>()

	constructor(value: T) {
		this.#value = value
	}

	static empty<T>() {
		return new Observable<T | undefined>(undefined)
	}

	get value() {
		return this.#value
	}

	set value(value: T) {
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
	const [value, setValue] = React.useState(observable.value)
	React.useEffect(() => observable.subscribe(setValue), [observable])
	return value
}
