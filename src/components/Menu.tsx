import * as Ariakit from "@ariakit/react"
import { ComponentProps, type ReactNode } from "react"
import { menuItem, menuPanel } from "~/styles/menu.ts"

export { MenuProvider } from "@ariakit/react"

export interface MenuOption {
	label: ReactNode
	icon: ReactNode
	onClick: () => void
}

export interface MenuProps extends Ariakit.MenuButtonProps {
	options: MenuOption[]
	providerProps?: Ariakit.MenuProviderProps
	panelProps?: Omit<ComponentProps<typeof MenuPanel>, "options">
}

export function Menu({
	options,
	providerProps,
	panelProps,
	...props
}: MenuProps) {
	return (
		<Ariakit.MenuProvider {...providerProps}>
			<Ariakit.MenuButton {...props} />
			<MenuPanel {...panelProps} options={options}></MenuPanel>
		</Ariakit.MenuProvider>
	)
}

export interface MenuPanelProps extends Ariakit.MenuProps {
	/** @deprecated */
	options?: MenuOption[]
}

export function MenuPanel({ options, children, ...props }: MenuPanelProps) {
	return (
		<Ariakit.Menu
			gutter={8}
			portal
			unmountOnHide
			{...props}
			className={menuPanel("w-fit min-w-32", props.className)}
		>
			{children}
			{options?.map((option, index) => (
				<Ariakit.MenuItem
					key={index}
					className={menuItem()}
					onClick={option.onClick}
				>
					{option.icon && <span className="mr-2">{option.icon}</span>}
					{option.label}
				</Ariakit.MenuItem>
			))}
		</Ariakit.Menu>
	)
}

export interface MenuItemProps extends Ariakit.MenuItemProps {
	icon: ReactNode
}

export function MenuItem({ icon, children, ...props }: MenuItemProps) {
	return (
		<Ariakit.MenuItem {...props} className={menuItem(props.className)}>
			{icon && <span className="mr-2 *:size-6">{icon}</span>}
			{children}
		</Ariakit.MenuItem>
	)
}
