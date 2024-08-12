import * as Ariakit from "@ariakit/react"
import { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import { mergeClassProp } from "./helpers.ts"
import { Popover } from "./popover.tsx"

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
			{...mergeClassProp(
				props,
				"rounded-box grid translate-y-2 gap-1 bg-base-100 p-1 opacity-0 transition data-[enter]:translate-y-0 data-[enter]:opacity-100",
			)}
		/>
	)
}

export function MenuItem(props: Ariakit.MenuItemProps) {
	return (
		<Ariakit.MenuItem
			{...props}
			className={twMerge(
				"btn btn-ghost btn-md justify-start text-left text-base",
				props.className,
			)}
		/>
	)
}
