import * as Ariakit from "@ariakit/react"
import { type ReactNode } from "react"
import { menuItem, menuPanel } from "~/styles/menu.ts"

export interface MenuProps extends Ariakit.MenuButtonProps {
	options: MenuOption[]
}

export interface MenuOption {
	label: ReactNode
	icon: ReactNode
	onClick: () => void
}

export function Menu({ options, ...props }: MenuProps) {
	return (
		<Ariakit.MenuProvider>
			<Ariakit.MenuButton {...props} />
			<Ariakit.Menu
				className={menuPanel("w-fit min-w-32")}
				gutter={8}
				portal
				unmountOnHide
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
