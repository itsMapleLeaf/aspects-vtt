import { useEffect, useState, useSyncExternalStore } from "react"
import { timeoutEffect } from "./async.ts"

export function useDelayedValue<T>(value: T, delay: number): T {
	const [delayed, setDelayed] = useState(value)
	useEffect(() => timeoutEffect(delay, setDelayed, value), [value, delay])
	return delayed
}

export function usePendingDelay(pendingInput: boolean) {
	return useDelayedValue(pendingInput, pendingInput ? 300 : 500)
}

export function useIsomorphicValue<ClientValue = undefined, ServerValue = undefined>(options: {
	client?: () => ClientValue
	server?: () => ServerValue
}) {
	return useSyncExternalStore<ClientValue | ServerValue | undefined>(
		() => () => {},
		() => options.client?.(),
		() => options.server?.(),
	)
}
