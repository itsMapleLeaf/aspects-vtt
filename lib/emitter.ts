import { useEffect, useState } from "react"

type Listener<T> = (value: T) => void

export function useEmitter<T>() {
	const [listeners] = useState(() => new Set<Listener<T>>())

	const listen = (listener: Listener<T>) => {
		listeners.add(listener)
		return () => {
			listeners.delete(listener)
		}
	}

	const emit = (value: T) => {
		for (const fn of listeners) fn(value)
	}

	return { listen, emit }
}

interface EmitterLike<T> {
	listen: (listener: Listener<T>) => () => void
}

export function useListen<T>(emitter: EmitterLike<T>, listener: Listener<T>) {
	useEffect(() => emitter.listen(listener))
}
