import * as React from "react"

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
