import { useDelayedValue } from "./useDelayedValue.ts"

export function usePendingDelay(pendingInput: boolean) {
	return useDelayedValue(pendingInput, pendingInput ? 300 : 500)
}
