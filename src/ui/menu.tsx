import * as Ariakit from "@ariakit/react"
import { ComponentProps } from "react"
import { Popover } from "./popover.tsx"
import { clearButton, panel } from "./styles.ts"
import { To } from "@remix-run/router"
import { NavLink } from "@remix-run/react"

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
				"grid min-w-40 max-w-64 translate-y-2 gap-1 p-1 opacity-0 transition data-[enter]:translate-y-0 data-[enter]:opacity-100",
				props.className,
			)}
		/>
	)
}

export function MenuItem({
	to,
	...props
}: Ariakit.MenuItemProps & {
	to?: To
}) {
	return (
		<Ariakit.MenuItem
			render={(props) =>
				to ? (
					<NavLink to={to} prefetch="intent" {...props} />
				) : (
					<button type="button" {...props} />
				)
			}
			{...props}
			className={clearButton(
				"cursor-pointer justify-start text-left text-base",
				props.className,
			)}
		/>
	)
}
