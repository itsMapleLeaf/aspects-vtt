import * as Lucide from "lucide-react"
import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import { Menu, MenuButton, MenuItem, MenuPanel } from "./Menu.tsx"
import { Tooltip } from "./Tooltip.tsx"

interface MoreMenuProps extends ComponentProps<"div"> {
	menuProps?: ComponentProps<typeof Menu>
}

export function MoreMenu({ children, menuProps, ...props }: MoreMenuProps) {
	return (
		<Menu placement="bottom" {...menuProps}>
			<div
				{...props}
				className={twMerge("group/more-menu relative", props.className)}
			>
				{children}
				<Tooltip content="More actions">
					<MenuButton className="flex-center absolute right-0 top-0 size-12 opacity-0 transition hover:!opacity-100 focus-visible:!opacity-100 group-hover/more-menu:opacity-50">
						<Lucide.MoreVertical />
					</MenuButton>
				</Tooltip>
			</div>
		</Menu>
	)
}

export const MoreMenuPanel = MenuPanel

export const MoreMenuItem = MenuItem
