import { LucideSidebarClose, LucideSidebarOpen } from "lucide-react"
import { clearCircleButton } from "../../ui/styles.ts"

interface SidebarToggleProps {
	open: boolean
	flipped?: boolean
	onClick: () => void
}

export function SidebarToggle({ open, flipped, onClick }: SidebarToggleProps) {
	const Icon = open ? LucideSidebarClose : LucideSidebarOpen
	return (
		<button type="button" className={clearCircleButton()} onClick={onClick}>
			<Icon className={flipped ? "-scale-x-100" : ""} />
		</button>
	)
}
