import * as FloatingUI from "@floating-ui/react-dom"
import * as React from "react"
import { createPortal } from "react-dom"
import { type ElementProp, renderElementProp } from "../common/ElementProp.tsx"

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
	whileElementsMounted: FloatingUI.autoUpdate,
} satisfies FloatingUI.UseFloatingOptions

const FloatingContext =
	React.createContext<FloatingUI.UseFloatingReturn | null>(null)

export interface FloatingProviderProps extends FloatingUI.UseFloatingOptions {
	children: React.ReactNode
}

export function FloatingProvider({
	children,
	...options
}: FloatingProviderProps) {
	const floating = FloatingUI.useFloating({
		...defaultFloatingOptions,
		...options,
	})
	return (
		<FloatingContext.Provider value={floating}>
			{children}
		</FloatingContext.Provider>
	)
}

export function FloatingReference({
	children,
}: {
	children: ElementProp<{
		ref: FloatingUI.UseFloatingReturn["refs"]["setReference"]
	}>
}) {
	const floating = React.useContext(FloatingContext)
	if (!floating) {
		throw new Error(
			`${FloatingReference.name} must be a child of ${FloatingProvider.name}`,
		)
	}
	return renderElementProp(children, { ref: floating.refs.setReference })
}

export interface FloatingProps extends React.ComponentPropsWithoutRef<"div"> {}

export function Floating(props: FloatingProps) {
	const floating = React.useContext(FloatingContext)
	if (!floating) {
		throw new Error(
			`${Floating.name} must be a child of ${FloatingProvider.name}`,
		)
	}
	return createPortal(
		<div
			{...props}
			ref={floating.refs.setFloating}
			style={{ ...floating.floatingStyles, ...props.style }}
		/>,
		document.body,
	)
}
