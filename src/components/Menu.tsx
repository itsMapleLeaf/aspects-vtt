import * as Ariakit from "@ariakit/react"
import { type ReactNode } from "react"
import { menuItem, menuPanel } from "~/styles/menu.ts"

export interface MenuOption {
	label: ReactNode
	icon: ReactNode
	onClick: () => void
}

export interface MenuProps extends Ariakit.MenuButtonProps {
	options: MenuOption[]
	providerProps?: Ariakit.MenuProviderProps
}

export function Menu({ options, providerProps, ...props }: MenuProps) {
	return (
		<MenuPanel {...providerProps} options={options}>
			<Ariakit.MenuButton {...props} />
		</MenuPanel>
	)
}

export interface MenuPanelProps extends Ariakit.MenuProviderProps {
	options: MenuOption[]
	menuProps?: Ariakit.MenuProps
}

export function MenuPanel({
	options,
	children,
	menuProps,
	...props
}: MenuPanelProps) {
	return (
		<Ariakit.MenuProvider {...props}>
			{children}
			<Ariakit.Menu
				gutter={8}
				portal
				unmountOnHide
				{...menuProps}
				className={menuPanel("w-fit min-w-32", menuProps?.className)}
			>
				{options.map((option, index) => (
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
		</Ariakit.MenuProvider>
	)
}
