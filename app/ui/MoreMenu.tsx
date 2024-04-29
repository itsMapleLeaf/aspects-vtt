import * as Lucide from "lucide-react"
import { twMerge } from "tailwind-merge"
import { Menu, MenuButton, MenuItem, MenuPanel } from "./Menu.tsx"
import { Tooltip } from "./Tooltip.tsx"

interface MoreMenuProps {
	options: MoreMenuOption[]
	children: React.ReactNode
	className?: string
}

interface MoreMenuOption {
	text: string
	icon: React.ReactNode
	onClick: () => unknown
}

export function MoreMenu(props: MoreMenuProps) {
	return (
		<div className={twMerge("group/more-menu relative", props.className)}>
			{props.children}
			<Menu placement="bottom">
				<Tooltip content="More actions">
					<MenuButton className="flex-center absolute right-0 top-0 size-12 opacity-0 transition hover:!opacity-100 focus-visible:!opacity-100 group-hover/more-menu:opacity-50">
						<Lucide.MoreVertical />
					</MenuButton>
				</Tooltip>
				<MenuPanel>
					{props.options.map((option) => (
						<MenuItem
							key={option.text}
							text={option.text}
							icon={option.icon}
							onClick={option.onClick}
						/>
					))}
				</MenuPanel>
			</Menu>
		</div>
	)
}
