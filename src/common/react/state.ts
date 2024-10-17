import * as React from "react"
import { useRef } from "react"
import { useLatestRef } from "~/common/react/core.ts"

export function useSwitch(initialOn: boolean) {
	return useSwitchActions(React.useState(initialOn))
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

export function useDebouncedCallback<Args extends unknown[]>(
	callback: (...args: Args) => void,
	period: number,
) {
	const callbackRef = useLatestRef(callback)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	)
	return React.useMemo(() => {
		function debounced(...args: Args) {
			clearTimeout(timeoutRef.current)
			timeoutRef.current = setTimeout(() => {
				callbackRef.current(...args)
			}, period)
		}
		debounced.cancel = () => clearTimeout(timeoutRef.current)
		return debounced
	}, [period])
}
