import { useEffect, useState } from "react"

type JsonValue =
	| string
	| number
	| boolean
	| null
	| JsonValue[]
	| { [key: string]: JsonValue | undefined }

export function useLocalStorageState<T extends JsonValue>(
	key: string,
	initialValue: T,
	schema: {
		parse: (input: unknown) => T
	},
) {
	return useLocalStorage(key, schema, useState(initialValue))
}

export function useLocalStorage<Value extends JsonValue, SetValue extends (value: Value) => void>(
	key: string,
	schema: { parse: (input: unknown) => Value },
	[value, setValue]: [Value, SetValue],
) {
	const [initialized, setInitialized] = useState(false)

	if (!initialized && typeof window !== "undefined") {
		const localStorageItem = window.localStorage.getItem(key)
		if (localStorageItem != null) {
			try {
				setValue(schema.parse(JSON.parse(localStorageItem)))
			} catch (error) {
				console.warn(`Failed to parse localStorage item for key "${key}"`, error)
			}
		}
		setInitialized(true)
	}

	useEffect(() => {
		if (!initialized) return
		if (value !== null) {
			window.localStorage.setItem(key, JSON.stringify(value))
		} else {
			window.localStorage.removeItem(key)
		}
	}, [key, value, initialized])

	return [value, setValue] as const
}
