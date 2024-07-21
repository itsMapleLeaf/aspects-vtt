import React from "react"
import { createPortal } from "react-dom"

export function Portal({ children }: { children: React.ReactNode }) {
	const [container, setContainer] = React.useState<HTMLElement | null>(null)
	React.useEffect(() => {
		setContainer(document.body)
	}, [])
	return container ? createPortal(children, container) : null
}
