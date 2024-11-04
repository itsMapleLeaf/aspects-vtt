import * as React from "react"
import { useRef, useState } from "react"
import { useLatestRef } from "../react/core.ts"

export function useSwitch(initialOn: boolean) {
	return useSwitchActions(React.useState(initialOn))
}

export function useSwitchActions([on, setOn]: readonly [
	boolean,
	React.Dispatch<React.SetStateAction<boolean>>,
]) {
	return [
		on,
		React.useMemo(
			() => ({
				enable: () => setOn(true),
				disable: () => setOn(false),
				toggle: () => setOn((current) => !current),
				set: (value: boolean) => setOn(value),
			}),
			[],
		),
	] as const
}

export function useDebouncedCallback<Args extends unknown[]>(
	callback: (...args: Args) => void,
	period: number,
) {
	const callbackRef = useLatestRef(callback)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	)
	return React.useMemo(() => {
		function debounced(...args: Args) {
			clearTimeout(timeoutRef.current)
			timeoutRef.current = setTimeout(() => {
				callbackRef.current(...args)
			}, period)
		}
		// eslint-disable-next-line react-compiler/react-compiler
		debounced.cancel = () => {
			clearTimeout(timeoutRef.current)
		}
		return debounced
	}, [period, callbackRef])
}

export function useDictionary<K extends PropertyKey, V>(
	initial?: Record<K, V>,
) {
	const [items, setItems] = useState<{ [_ in K]?: V }>(initial ?? {})

	const get = (key: K): V | undefined => items[key]

	const set = (key: K, value: V): V => {
		setItems((prevItems) => ({ ...prevItems, [key]: value }))
		return value
	}

	const remove = (key: K) => {
		setItems((prevItems) => {
			const { [key]: _, ...rest } = prevItems
			return rest as Record<K, V>
		})
	}

	const update = (key: K, next: (current: V) => V): V | undefined => {
		const currentValue = items[key]
		if (currentValue !== undefined) {
			const newValue = next(currentValue)
			setItems((prevItems) => ({ ...prevItems, [key]: newValue }))
			return newValue
		}
		return undefined
	}

	const patch = (key: K, patch: Partial<V>): V | undefined => {
		const currentValue = items[key]
		if (currentValue !== undefined) {
			const newValue = { ...currentValue, ...patch }
			setItems((prevItems) => ({ ...prevItems, [key]: newValue }))
			return newValue as V
		}
		return undefined
	}

	const keys = (): K[] => {
		return Object.keys(items) as K[]
	}

	const values = (): V[] => {
		return Object.values(items)
	}

	const entries = (): readonly [K, V][] => {
		return Object.entries(items) as [K, V][]
	}

	const size = (): number => {
		return Object.keys(items).length
	}

	return {
		get,
		set,
		remove,
		update,
		patch,
		keys,
		values,
		entries,
		size,
	}
}
