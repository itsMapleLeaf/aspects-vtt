import * as Ariakit from "@ariakit/react"
import { panel } from "./styles.ts"

export function Menu(props: Ariakit.MenuProviderProps) {
	return <Ariakit.MenuProvider {...props} />
}

export function MenuButton(props: Ariakit.MenuButtonProps) {
	return <Ariakit.MenuButton {...props} />
}

export function MenuPanel(props: Ariakit.MenuProps) {
	return (
		<Ariakit.Menu
			portal
			gutter={8}
			{...props}
			className={panel(
				"grid w-[--popover-anchor-width] translate-y-2 gap-1 p-1 opacity-0 transition data-[enter]:translate-y-0 data-[enter]:opacity-100",
			)}
		/>
	)
}

export function MenuItem(props: Ariakit.MenuItemProps) {
	return (
		<Ariakit.MenuItem
			{...props}
			className="cursor-default rounded-sm px-2 py-2 transition duration-75 hover:bg-primary-100"
		/>
	)
}
