import { startTransition, useState } from "react"
import { useToastAction } from "../../components/ToastActionForm.tsx"
import { useDebouncedCallback } from "./state.ts"

export function usePatchUpdate<T>(
	base: T,
	save: (patch: Partial<T>) => Promise<unknown>,
) {
	const [patch, setPatch] = useState<Partial<T>>({})
	const patched: T = { ...base, ...patch }

	const [, action] = useToastAction(async (_state: unknown, _payload: void) => {
		await save(patch)
		setPatch((current) => (patch === current ? {} : current))
	})

	const submit = () => {
		startTransition(() => {
			action()
		})
	}

	const submitDebounced = useDebouncedCallback(submit, 300)

	const update = (patch: Partial<T>) => {
		setPatch((current) => ({ ...current, ...patch }))
		submitDebounced()
	}

	return {
		patched,
		update,
		submit: () => {
			submitDebounced.cancel() // cancel any pending debounced calls, just in case
			submit()
		},
		submitDebounced,
	}
}
