import { useEffect, useRef, useState } from "react"
import { useEffectEvent } from "../../common/react/hooks.ts"

export function useDelayedSyncInput(args: {
	value: string
	onSubmit: (value: string) => void
}) {
	const [pendingValue, setPendingValue] = useState<string>()
	const submitTimeout = useRef<number | undefined>(undefined)

	useEffect(() => {
		return () => window.clearTimeout(submitTimeout.current)
	}, [])

	// when the outside value has synchronized,
	// we'll delete the internal value to allow further updates
	useEffect(() => {
		if (args.value === pendingValue) {
			setPendingValue(undefined)
		}
	}, [args.value, pendingValue])

	// ensure we submit if we have a pending value on unmount
	const submitOnUnmount = useEffectEvent(() => {
		if (pendingValue != null) {
			args.onSubmit(pendingValue)
		}
	})
	useEffect(() => {
		return () => {
			submitOnUnmount()
		}
	}, [submitOnUnmount])

	return {
		value: pendingValue ?? args.value,
		onChange: (newInput: string | React.ChangeEvent<{ value: string }>) => {
			const value =
				typeof newInput === "string" ? newInput : newInput.currentTarget.value

			setPendingValue(value)

			window.clearTimeout(submitTimeout.current)
			submitTimeout.current = window.setTimeout(() => {
				args.onSubmit(value)
			}, 500)
		},
		onBlur: (newInput: string | React.FocusEvent<{ value: string }>) => {
			const value =
				typeof newInput === "string" ? newInput : newInput.currentTarget.value
			window.clearTimeout(submitTimeout.current)
			args.onSubmit(value)
		},
	}
}
