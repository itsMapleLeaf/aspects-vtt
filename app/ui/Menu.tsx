import * as Ariakit from "@ariakit/react"
import { twMerge, type ClassNameValue } from "tailwind-merge"
import { Button } from "./Button.tsx"
import { panel } from "./styles.ts"

export function Menu(props: Ariakit.MenuProviderProps) {
	return <Ariakit.MenuProvider {...props} />
}

export const MenuButton = Ariakit.MenuButton

export function menuPanelStyle(...classes: ClassNameValue[]) {
	return panel(
		"grid translate-y-2 gap-1 p-1 opacity-0 transition shadow-md data-[enter]:translate-y-0 data-[enter]:opacity-100",
		classes,
	)
}

export function MenuPanel(props: Ariakit.MenuProps) {
	return (
		<Ariakit.Menu
			portal
			gutter={8}
			unmountOnHide
			{...props}
			className={twMerge(menuPanelStyle(), props.className)}
		/>
	)
}

export function menuItemStyle(...classes: ClassNameValue[]) {
	return twMerge(
		"flex cursor-default gap-2 rounded-sm px-2 py-2 transition duration-75 data-[active-item]:bg-primary-100 data-[active-item]:text-primary-700",
		classes,
	)
}

interface MenuItemProps extends Ariakit.MenuItemProps<"div"> {
	text: string
	icon: React.ReactNode
	onClick?: (event: React.MouseEvent<HTMLElement>) => unknown
}

export function MenuItem({ text, icon, ref, ...props }: MenuItemProps) {
	return (
		<Ariakit.MenuItem
			{...props}
			render={
				<Button
					text={text}
					icon={icon}
					className="cursor-default justify-start border-none text-left"
				/>
			}
		/>
	)
}
