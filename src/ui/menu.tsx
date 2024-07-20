import { offset, Placement, shift, useFloating } from "@floating-ui/react-dom"
import React, { useEffect } from "react"
import ReactDOM from "react-dom"
import { FocusOn } from "react-focus-on"
import { useMergedRefs } from "../../lib/react.ts"
import { Button, ButtonProps } from "./button.tsx"
import { mergeClassProp } from "./helpers.ts"
import { Panel } from "./panel.tsx"
import { fadeZoomTransition } from "./transitions.ts"

interface MenuOptions {
	placement?: Placement
}

function useMenuState({ placement = "bottom" }: MenuOptions) {
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

const MenuContext = React.createContext<ReturnType<typeof useMenuState> | null>(
	null,
)

export function Menu({
	children,
	...props
}: { children: React.ReactNode } & MenuOptions) {
	const context = useMenuState(props)
	return <MenuContext.Provider value={context}>{children}</MenuContext.Provider>
}

function useMenuContext() {
	const context = React.useContext(MenuContext)
	if (context === null) {
		throw new Error("useMenuContext must be used within a Menu provider")
	}
	return context
}

Menu.Button = MenuButton
function MenuButton(props: React.ComponentProps<"button">) {
	const context = useMenuContext()
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

Menu.Panel = MenuPanel
function MenuPanel(
	props: React.ComponentProps<"div"> & { children: React.ReactNode },
) {
	const context = useMenuContext()
	const ref = useMergedRefs(context.panelRef, props.ref)

	// FocusOn can't steal focus state when turning on right away,
	// so we have to delay it on open
	const [enabled, setEnabled] = React.useState(false)
	useEffect(() => {
		setEnabled(context.open)
	}, [context.open])

	return ReactDOM.createPortal(
		<div ref={context.panelRef} style={context.panelStyle}>
			<FocusOn
				as={Panel}
				enabled={context.open ? enabled : false}
				onEscapeKey={() => context.setOpen(false)}
				onClickOutside={() => context.setOpen(false)}
				{...mergeClassProp(
					props,
					"grid gap-1 p-1",
					fadeZoomTransition(context.open),
				)}
				ref={ref}
			/>
		</div>,
		document.body,
	)
}

Menu.Item = MenuItem
function MenuItem(props: ButtonProps) {
	const context = useMenuContext()
	return (
		<Button
			align="start"
			appearance="clear"
			{...props}
			onClick={(event) => {
				props.onClick?.(event)
				if (event.defaultPrevented) return
				context.setOpen(false)
			}}
		/>
	)
}
