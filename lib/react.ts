import React, {
	useCallback,
	useEffect,
	useInsertionEffect,
	useLayoutEffect,
	useRef,
} from "react"
import { Nullish } from "./types.ts"

export function useMergedRefs<T>(...refs: Nullish<React.Ref<T>>[]) {
	const cache = useRef(refs)
	useEffect(() => {
		cache.current = refs
	})

	return useCallback((node: T | null) => {
		for (const ref of cache.current) {
			if (typeof ref === "function") {
				ref(node)
			} else if (ref) {
				ref.current = node
			}
		}
	}, [])
}

export function useLocalStorage<T>(
	key: string,
	initialValue: T,
	parse: (deserialized: unknown) => T,
) {
	const [value, setValue] = React.useState<T>(initialValue)

	const loadValue = useEffectEvent((key: string) => {
		const serialized = localStorage.getItem(key)
		if (serialized == null) return

		try {
			const parsed = parse(JSON.parse(serialized))
			setValue(parsed)
		} catch (error) {
			console.error(
				new Error(`Failed to parse local storage value (key: "${key}")`, {
					cause: error,
				}),
			)
		}
	})

	useLayoutEffect(() => {
		loadValue(key)
	}, [key])

	const saveValue = useEffectEvent((action: React.SetStateAction<T>) => {
		setValue(action)
		localStorage.setItem(
			key,
			JSON.stringify(action instanceof Function ? action(value) : action),
		)
	})

	return [value, saveValue] as const
}

export function useEffectEvent<Args extends unknown[], Result>(
	fn: (...args: Args) => Result,
) {
	const ref = useRef<typeof fn>(() => {
		throw new Error("attempted to call effect function during render")
	})

	// useInsertionEffect makes this run before useLayoutEffect and useEffect
	useInsertionEffect(() => {
		ref.current = fn
	})

	return useCallback((...args: Args) => ref.current(...args), [])
}
