import { useSyncExternalStore } from "react"
import ReactDOM from "react-dom"
import type { Nullish } from "~/helpers/types.ts"

export function Portal({
	children,
	enabled = true,
	container: customContainer,
}: {
	children: React.ReactNode
	enabled?: boolean
	container?: Nullish<Element>
}) {
	const container = useSyncExternalStore(
		() => () => {},
		() => (enabled ? customContainer ?? document.body : null),
		() => null,
	)
	return container ? ReactDOM.createPortal(children, container) : children
}
