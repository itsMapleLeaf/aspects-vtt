import * as Ariakit from "@ariakit/react"
import { NavLink } from "@remix-run/react"
import { To } from "@remix-run/router"
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
				"grid min-w-40 max-w-64 translate-y-2 p-1 opacity-0 transition gap-1 data-[enter]:translate-y-0 data-[enter]:opacity-100",
				props.className,
			)}
		/>
	)
}

export function MenuItem({
	to,
	type = "button",
	...props
}: Ariakit.MenuItemProps & {
	to?: To
	type?: "submit" | "button"
}) {
	return (
		<Ariakit.MenuItem
			render={(props) =>
				to ? (
					<NavLink to={to} prefetch="intent" {...props} />
				) : (
					<button {...props} type={type} />
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
