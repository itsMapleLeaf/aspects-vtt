import * as FloatingUI from "@floating-ui/react-dom"
import * as React from "react"
import { createPortal } from "react-dom"

export const defaultFloatingOptions = {
	placement: "top",
	strategy: "fixed",
	middleware: [
		FloatingUI.offset(8),
		FloatingUI.shift({
			crossAxis: true,
			padding: 8,
		}),
	],
} satisfies FloatingUI.UseFloatingOptions

export function createFloatingComponents() {
	const FloatingContext = React.createContext<FloatingUI.UseFloatingReturn | null>(null)

	interface FloatingProviderProps extends FloatingUI.UseFloatingOptions {
		children: React.ReactNode
	}

	function FloatingProvider({ children, ...options }: FloatingProviderProps) {
		const floating = FloatingUI.useFloating({
			...defaultFloatingOptions,
			...options,
		})
		return <FloatingContext.Provider value={floating}>{children}</FloatingContext.Provider>
	}

	function useFloatingContext() {
		const floating = React.use(FloatingContext)
		if (!floating) {
			throw new Error(`FloatingProvider not found`)
		}
		return floating
	}

	function FloatingReference(props: React.ComponentProps<"div">) {
		const floating = useFloatingContext()
		return <div {...props} ref={floating.refs.setReference} />
	}

	function Floating(props: React.ComponentProps<"div">) {
		const floating = useFloatingContext()
		return (
			<>
				{createPortal(
					<div
						{...props}
						ref={floating.refs.setFloating}
						// eslint-disable-next-line react/prop-types
						style={{ ...floating.floatingStyles, ...props.style }}
					/>,
					document.body,
				)}
			</>
		)
	}

	return {
		FloatingProvider,
		FloatingReference,
		Floating,
	}
}
