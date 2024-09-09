import * as React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
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

export function useFilter<In, Out extends In>(
	input: In,
	filter: (value: In) => value is Out,
): In | Out {
	const [output, setOutput] = useState(input)
	if (output !== input && filter(input)) {
		setOutput(input)
	}
	return output
}

export function useImage(src: string | undefined | null) {
	const [image, setImage] = useState<HTMLImageElement | null>(null)
	const [status, setStatus] = useState<"loading" | "loaded" | "error">(
		"loading",
	)

	React.useEffect(() => {
		if (!src) {
			setImage(null)
			setStatus("error")
			return
		}

		const img = new Image()
		img.src = src

		const controller = new AbortController()

		img.addEventListener(
			"load",
			() => {
				setImage(img)
				setStatus("loaded")
			},
			{ signal: controller.signal },
		)

		img.addEventListener(
			"error",
			() => {
				setImage(null)
				setStatus("error")
			},
			{ signal: controller.signal },
		)

		return () => {
			controller.abort()
		}
	}, [src])

	return [image, status] as const
}

export function useSize() {
	const [size, setSize] = useState({ width: 0, height: 0 })
	const [element, ref] = useState<HTMLElement | null>(null)

	React.useEffect(() => {
		if (!element) return

		setSize({ width: element.clientWidth, height: element.clientHeight })

		const observer = new ResizeObserver(([info]) => {
			setSize({
				width: info!.contentRect.width,
				height: info!.contentRect.height,
			})
		})

		observer.observe(element)

		return () => {
			observer.disconnect()
		}
	}, [element])

	return [size, ref] as const
}

export function useDebouncedValue<T>(value: T, delay: number) {
	const [debouncedValue, setDebouncedValue] = useState(value)

	useEffect(() => {
		const timeout = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)
		return () => clearTimeout(timeout)
	}, [value, delay])

	return debouncedValue
}

export function useEffectRef<T>(value: T) {
	const ref = useRef(value)
	useEffect(() => {
		ref.current = value
	}, [value])
	return ref
}

export function usePointerDownDoubleClick<Target extends HTMLElement>(
	onDoubleClick: (event: React.PointerEvent<Target>) => void,
	delay = 200,
) {
	const lastClickTime = useRef<number | null>(null)
	const onDoubleClickRef = useEffectRef(onDoubleClick)

	return useCallback(
		(event: React.PointerEvent<Target>) => {
			const now = Date.now()
			if (
				lastClickTime.current != null &&
				now - lastClickTime.current < delay
			) {
				onDoubleClickRef.current(event)
				lastClickTime.current = null
			} else {
				lastClickTime.current = now
			}
		},
		[delay],
	)
}
