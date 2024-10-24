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

type RefType<T> = T extends React.Ref<infer V> ? V : never

export function useMergedRefs<
	Refs extends Array<React.Ref<unknown> | undefined>,
>(...refs: Refs) {
	return React.useCallback((node: RefType<Refs[number]> | null) => {
		for (const ref of refs) {
			if (typeof ref === "function") {
				ref(node)
			} else if (ref != null) {
				ref.current = node
			}
		}
		// eslint-disable-next-line react-compiler/react-compiler
	}, refs)
}

export function useLatestRef<T>(value: T) {
	const ref = React.useRef(value)
	React.useEffect(() => {
		ref.current = value
	})
	return ref
}
