import * as React from "react"
import * as v from "valibot"
import { useEffectEvent } from "./core.ts"
import { useSwitchActions } from "./state.ts"

export function useWindowSize() {
	const [width, setWidth] = React.useState(0)
	const [height, setHeight] = React.useState(0)

	React.useEffect(() => {
		const handleResize = () => {
			setWidth(window.innerWidth)
			setHeight(window.innerHeight)
		}
		handleResize()

		const controller = new AbortController()

		window.addEventListener("resize", handleResize, {
			signal: controller.signal,
		})

		return () => {
			controller.abort()
		}
	}, [])

	return [width, height] as const
}

type JsonInput =
	| string
	| number
	| boolean
	| null
	| undefined
	| { toJSON: () => JsonInput }
	| { [key: string]: JsonInput }
	| JsonInput[]

type JsonOutput =
	| string
	| number
	| boolean
	| null
	| undefined
	| { [key: string]: JsonOutput }
	| JsonOutput[]

export function useLocalStorage<T extends JsonInput>(
	key: string,
	initialValue: T,
	parse: (deserialized: JsonOutput) => T,
) {
	const [value, setValue] = React.useState<T>(initialValue)

	const loadValue = useEffectEvent((key: string) => {
		const serialized = localStorage.getItem(key)
		if (serialized == null) return

		try {
			const parsed = parse(JSON.parse(serialized) as JsonOutput)
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
	}, [key, loadValue])

	const idleCallbackRef = React.useRef<number | undefined>(undefined)
	const saveValue = useEffectEvent((action: React.SetStateAction<T>) => {
		setValue(action)

		if (idleCallbackRef.current != null) {
			cancelIdleCallback(idleCallbackRef.current)
		}

		idleCallbackRef.current = requestIdleCallback(() => {
			localStorage.setItem(
				key,
				JSON.stringify(action instanceof Function ? action(value) : action),
			)
		})
	})

	return [value, saveValue] as const
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

export function useImage(src: string | undefined | null) {
	const [image, setImage] = React.useState<HTMLImageElement>()
	const [status, setStatus] = React.useState<"loading" | "loaded" | "error">(
		"loading",
	)

	React.useLayoutEffect(() => {
		if (!src) {
			setImage(undefined)
			setStatus("error")
			return
		}

		const img = new Image()
		img.src = src

		if (img.complete) {
			setImage(img)
			setStatus("loaded")
			return
		}

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
				setImage(undefined)
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
	const [size, setSize] = React.useState({ width: 0, height: 0 })
	const [element, ref] = React.useState<HTMLElement | null>(null)

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
