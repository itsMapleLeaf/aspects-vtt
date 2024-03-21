import { useEffect, useState } from "react"

type JsonValue =
	| string
	| number
	| boolean
	| null
	| JsonValue[]
	| { [key: string]: JsonValue | undefined }

export function useLocalStorage<T extends JsonValue>(
	key: string,
	initialValue: T,
	schema: {
		parse: (input: unknown) => T
	},
) {
	const [value, setValue] = useState(initialValue)
	const [initialized, setInitialized] = useState(false)

	if (!initialized && typeof window !== "undefined") {
		try {
			const item = window.localStorage.getItem(key)
			if (item) {
				setValue(schema.parse(JSON.parse(item)))
			} else {
				setValue(initialValue)
			}
		} catch {
			setValue(initialValue)
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

	return [value ?? initialValue, setValue] as const
}
