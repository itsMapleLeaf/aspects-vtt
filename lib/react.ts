import { useCallback, useEffect, useRef } from "react"
import { Nullish } from "./types.ts"

export function useMergedRefs<T>(...refs: Nullish<React.Ref<T>>[]) {
	const cache = useRef(refs)
	useEffect(() => {
		cache.current = refs
	})

	return useCallback((node: T | null) => {
		for (const ref of cache.current) {
			if (typeof ref === "function") {
				ref(node)
			} else if (ref) {
				ref.current = node
			}
		}
	}, [])
}
