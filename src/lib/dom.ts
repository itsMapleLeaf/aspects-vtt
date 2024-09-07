import { assert } from "./assertions"

export function observeSize(
	container: HTMLElement,
	onSizeChanged: (contentRect: DOMRectReadOnly) => void,
) {
	const observer = new ResizeObserver(([entry]) => {
		onSizeChanged(
			assert(entry?.contentRect, "ResizeObserverEntry is undefined"),
		)
	})

	observer.observe(container)
	return () => observer.disconnect()
}
