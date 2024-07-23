import { useSyncExternalStore } from "react"
import ReactDOM from "react-dom"

export function Portal({
	children,
	enabled = true,
}: {
	children: React.ReactNode
	enabled?: boolean
}) {
	const container = useSyncExternalStore(
		() => () => {},
		() => (enabled ? document.body : null),
		() => null,
	)
	return container ? ReactDOM.createPortal(children, container) : children
}
