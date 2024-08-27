import * as Ariakit from "@ariakit/react"
import { ComponentProps } from "react"
import { Popover } from "./popover.tsx"
import { clearButton, panel } from "./styles.ts"

export function Menu(props: ComponentProps<typeof Popover>) {
	return <Ariakit.MenuProvider {...props} />
}

export const MenuButton = Ariakit.MenuButton

export function MenuPanel(props: Ariakit.MenuProps) {
	return (
		<Ariakit.Menu
			modal
			gutter={8}
			unmountOnHide
			{...props}
			className={panel(
				"grid translate-y-2 gap-1 p-1 opacity-0 transition data-[enter]:translate-y-0 data-[enter]:opacity-100",
				props.className,
			)}
		/>
	)
}

export function MenuItem(props: Ariakit.MenuItemProps) {
	return (
		<Ariakit.MenuItem
			{...props}
			className={clearButton(
				"justify-start text-left text-base",
				props.className,
			)}
		/>
	)
}
