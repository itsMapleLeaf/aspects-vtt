import * as Ariakit from "@ariakit/react"
import { twMerge, type ClassNameValue } from "tailwind-merge"
import type { Overwrite } from "~/helpers/types.ts"
import { Button, type ButtonProps } from "./Button.tsx"
import { panel } from "./styles.ts"
import { withMergedClassName } from "./withMergedClassName.ts"

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
			unmountOnHide
			{...props}
			className={twMerge(MenuPanel.style(), props.className)}
		/>
	)
}
MenuPanel.style = function menuPanelStyle(...classes: ClassNameValue[]) {
	return panel(
		"grid translate-y-2 gap-1 p-1 opacity-0 transition shadow-md data-[enter]:translate-y-0 data-[enter]:opacity-100",
		classes,
	)
}

export type MenuItemProps = Overwrite<
	ButtonProps,
	{
		onClick?: (event: React.MouseEvent<HTMLElement>) => void
	}
>

export function MenuItem({ onClick, ...props }: MenuItemProps) {
	return (
		<Ariakit.MenuItem
			onClick={onClick}
			render={
				<Button
					{...withMergedClassName(props, "cursor-default justify-start border-none text-left")}
				/>
			}
		>
			{props.children}
		</Ariakit.MenuItem>
	)
}
MenuItem.style = function menuItemStyle(...classes: ClassNameValue[]) {
	return twMerge(
		"flex cursor-default rounded-sm px-2 py-2 transition duration-75 gap-2 data-[active-item]:bg-primary-100 data-[active-item]:text-primary-700",
		classes,
	)
}
