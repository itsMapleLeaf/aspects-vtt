import * as Ariakit from "@ariakit/react"
import { useState } from "react"
import { Menu, MenuItem, MenuPanel } from "./Menu.tsx"

export interface ContextMenuProps {
	options: ContextMenuOption[]
	children: React.ReactNode
	className?: string
}

export interface ContextMenuOption {
	label: string
	icon: React.ReactNode
	onClick: () => void
}

export function ContextMenu(props: ContextMenuProps) {
	const store = Ariakit.useMenuStore()
	const [pointer, setPointer] = useState({ x: 0, y: 0 })
	return (
		<div
			className={props.className}
			onContextMenu={(event) => {
				event.preventDefault()
				setPointer({ x: event.clientX, y: event.clientY })
				store.show()
			}}
		>
			{props.children}
			<Menu store={store}>
				<MenuPanel modal getAnchorRect={() => pointer}>
					{props.options.map((option) => (
						<MenuItem
							key={option.label}
							icon={option.icon}
							text={option.label}
							onClick={option.onClick}
						/>
					))}
				</MenuPanel>
			</Menu>
		</div>
	)
}
