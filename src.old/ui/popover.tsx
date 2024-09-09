import { offset, Placement, shift, useFloating } from "@floating-ui/react-dom"
import React, { useEffect } from "react"
import { FocusOn } from "react-focus-on"
import { useMergedRefs } from "~/common/react/core.ts"
import { mergeClassProp } from "./helpers.ts"
import { Portal } from "./portal.tsx"
import { fadeZoomTransition } from "./transitions.ts"

interface PopoverOptions {
	placement?: Placement
}

function usePopoverState({ placement = "bottom" }: PopoverOptions) {
	const [open, setOpen] = React.useState(false)

	const { refs, floatingStyles } = useFloating({
		placement,
		middleware: [offset(8), shift({ padding: 8 })],
	})

	return {
		open,
		setOpen,
		buttonRef: refs.setReference,
		panelRef: refs.setFloating,
		panelStyle: floatingStyles,
	}
}

const PopoverContext = React.createContext<ReturnType<
	typeof usePopoverState
> | null>(null)

export function Popover({
	children,
	...props
}: { children: React.ReactNode } & PopoverOptions) {
	const context = usePopoverState(props)
	return (
		<PopoverContext.Provider value={context}>
			{children}
		</PopoverContext.Provider>
	)
}

export function usePopoverContext() {
	const context = React.useContext(PopoverContext)
	if (context === null) {
		throw new Error("usePopoverContext must be used within a Popover provider")
	}
	return context
}

export function PopoverButton(props: React.ComponentProps<"button">) {
	const context = usePopoverContext()
	const ref = useMergedRefs(context.buttonRef, props.ref)
	return (
		<button
			type="button"
			{...props}
			ref={ref}
			onClick={(event) => {
				props.onClick?.(event)
				context.setOpen((open) => !open)
			}}
		/>
	)
}

Popover.Panel = PopoverPanel
export function PopoverPanel(
	props: React.ComponentProps<"div"> & { children: React.ReactNode },
) {
	const context = usePopoverContext()
	const ref = useMergedRefs(context.panelRef, props.ref)

	// FocusOn can't steal focus state when turning on right away,
	// so we have to delay it on open
	const [enabled, setEnabled] = React.useState(false)
	useEffect(() => {
		setEnabled(context.open)
	}, [context.open])

	return (
		<Portal>
			<div ref={context.panelRef} style={context.panelStyle}>
				<FocusOn
					enabled={context.open ? enabled : false}
					onEscapeKey={() => context.setOpen(false)}
					onClickOutside={() => context.setOpen(false)}
					{...mergeClassProp(props, fadeZoomTransition(context.open))}
					ref={ref}
				/>
			</div>
		</Portal>
	)
}
