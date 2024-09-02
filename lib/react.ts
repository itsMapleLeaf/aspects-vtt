import * as React from "react"
import * as v from "valibot"
import { Nullish } from "./types.ts"

export function useMergedRefs<T>(...refs: Nullish<React.Ref<T>>[]) {
	const cache = React.useRef(refs)
	React.useEffect(() => {
		cache.current = refs
	})

	return React.useCallback((node: T | null) => {
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

	React.useLayoutEffect(() => {
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
	const ref = React.useRef<typeof fn>(() => {
		throw new Error("attempted to call effect function during render")
	})

	// useInsertionEffect makes this run before useLayoutEffect and useEffect
	React.useInsertionEffect(() => {
		ref.current = fn
	})

	return React.useCallback((...args: Args) => ref.current(...args), [])
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

export function useSwitch(initialOn: boolean) {
	return useSwitchActions(React.useState(initialOn))
}

export function useLocalStorageSwitch(key: string, initialOn: boolean) {
	return useSwitchActions(
		useLocalStorage(key, initialOn, v.parser(v.boolean())),
	)
}

export function usePointer(enabled = true) {
	const [pointer, setPointer] = React.useState<{ x: number; y: number }>()

	React.useEffect(() => {
		if (!enabled) return

		const handler = (event: PointerEvent) => {
			setPointer({ x: event.clientX, y: event.clientY })
		}

		const controller = new AbortController()

		window.addEventListener("pointerdown", handler, {
			signal: controller.signal,
		})

		window.addEventListener("pointermove", handler, {
			signal: controller.signal,
		})

		return () => controller.abort()
	}, [enabled])

	return pointer
}

export function useMediaQuery(query: string) {
	const [matches, setMatches] = React.useState(false)

	React.useLayoutEffect(() => {
		const media = window.matchMedia(query)
		setMatches(media.matches)

		const controller = new AbortController()

		media.addEventListener(
			"change",
			(event) => {
				setMatches(event.matches)
			},
			{ signal: controller.signal },
		)

		return () => controller.abort()
	}, [query])

	return matches
}

export function useCssVar(name: string, customElement?: HTMLElement) {
	const [value, setValue] = React.useState("")

	React.useLayoutEffect(() => {
		const element = customElement ?? document.body
		if (!element) {
			return
		}

		setValue(window.getComputedStyle(element).getPropertyValue(name))

		const observer = new MutationObserver(() => {
			const newValue = window.getComputedStyle(element).getPropertyValue(name)
			if (newValue !== value) {
				setValue(newValue)
			}
		})

		observer.observe(element, {
			attributes: true,
			attributeFilter: ["style"],
		})

		return () => observer.disconnect()
	}, [name, customElement])

	return value
}

export function useSet<T>(initialValue?: Iterable<T>) {
	const [value, setValue] = React.useState<ReadonlySet<T>>(
		new Set(initialValue ?? []),
	)

	const actions = React.useMemo(
		() => ({
			add: (item: T) => {
				setValue((current) => new Set([...current, item]))
			},
			remove: (item: T) => {
				setValue((current) => {
					const next = new Set(current)
					next.delete(item)
					return next
				})
			},
			toggle: (item: T) => {
				setValue((current) => {
					const next = new Set(current)
					next.has(item) ? next.delete(item) : next.add(item)
					return next
				})
			},
			set: (items: Iterable<T>) => {
				setValue(new Set(items))
			},
			clear: () => {
				setValue(new Set())
			},
		}),
		[],
	)

	return [value, actions] as const
}
