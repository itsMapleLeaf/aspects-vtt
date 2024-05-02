import * as Ariakit from "@ariakit/react"
import { type ClassNameValue, twMerge } from "tailwind-merge"
import { Button } from "./Button.tsx"
import { panel } from "./styles.ts"

export function Menu(props: Ariakit.MenuProviderProps) {
	return <Ariakit.MenuProvider {...props} />
}

export const MenuButton = Ariakit.MenuButton

export function menuPanelStyle(...classes: ClassNameValue[]) {
	return panel(
		"grid translate-y-2 gap-1 p-1 opacity-0 transition shadow-black/50 shadow-md data-[enter]:translate-y-0 data-[enter]:opacity-100",
		classes,
	)
}

export function MenuPanel(props: Ariakit.MenuProps) {
	return <Ariakit.Menu portal gutter={8} unmountOnHide {...props} className={menuPanelStyle()} />
}

export function menuItemStyle(...classes: ClassNameValue[]) {
	return twMerge(
		"flex cursor-default gap-2 rounded-sm px-2 py-2 transition duration-75 data-[active-item]:bg-primary-100 data-[active-item]:text-primary-700",
		classes,
	)
}

interface MenuItemProps extends Ariakit.MenuItemProps {
	text: string
	icon: React.ReactNode
}

export function MenuItem({ text, icon, ...props }: MenuItemProps) {
	return (
		<Button
			text={text}
			icon={icon}
			className="cursor-default justify-start border-none text-left"
			element={<Ariakit.MenuItem {...props} />}
		/>
	)
}
