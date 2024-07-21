import { ComponentProps } from "react"
import { Button, ButtonProps } from "./button.tsx"
import { mergeClassProp } from "./helpers.ts"
import { Popover, usePopoverContext } from "./popover.tsx"

export { usePopoverContext as useMenuContext }

export function Menu(props: ComponentProps<typeof Popover>) {
	return <Popover {...props} />
}
Menu.Button = Popover.Button

Menu.Panel = MenuPanel
function MenuPanel(props: ComponentProps<typeof Popover.Panel>) {
	return <Popover.Panel {...mergeClassProp(props, "grid gap-1 p-1")} />
}

Menu.Item = MenuItem
function MenuItem(props: ButtonProps) {
	const context = usePopoverContext()
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
