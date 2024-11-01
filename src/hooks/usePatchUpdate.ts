import { startTransition, useState } from "react"
import { useDebouncedCallback } from "../../lib/react/state.ts"
import { useToastAction } from "../components/ToastActionForm.tsx"

export function usePatchUpdate<Entity, Patch = Entity>(
	base: Entity,
	save: (patch: Partial<Patch>) => Promise<unknown>,
) {
	const [patch, setPatch] = useState<Partial<Patch>>({})
	const patched: Entity = { ...base, ...patch }

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

	const update = (patch: Partial<Patch>) => {
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
