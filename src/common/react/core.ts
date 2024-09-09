import * as React from "react"

export function useEffectEvent<Args extends unknown[], Result>(
	fn: (...args: Args) => Result,
) {
	const ref = React.useRef<typeof fn>(() => {
		throw new Error("attempted to call effect function during render")
	})

	// useInsertionEffect makes this run before useLayoutEffect and useEffect
	React.useInsertionEffect(() => {
		ref.current = fn
	})

	return React.useCallback((...args: Args) => ref.current(...args), [])
}
