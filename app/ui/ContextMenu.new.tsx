import { startTransition, useState } from "react"
import { Menu, MenuPanel } from "~/ui/Menu.tsx"
import { Rect } from "../../common/Rect"

export function ContextMenu({
	trigger,
	children,
}: {
	trigger: React.ReactNode
	children: React.ReactNode
}) {
	const [open, setOpen] = useState(false)
	const [rect, setRect] = useState<Rect | null>(null)

	return (
		<>
			<div
				onContextMenu={(event) => {
					event.preventDefault()
					startTransition(() => {
						setRect(Rect.from(event.currentTarget.getBoundingClientRect()))
						setOpen(true)
					})
				}}
			>
				{trigger}
			</div>
			<Menu placement="bottom-start" open={open} setOpen={setOpen}>
				<MenuPanel getAnchorRect={() => rect}>{children}</MenuPanel>
			</Menu>
		</>
	)
}
