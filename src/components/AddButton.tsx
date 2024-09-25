import { LucideCheck, LucidePlus } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "~/components/Button.tsx"
import { ToastActionForm } from "~/components/ToastActionForm.tsx"

export function AddButton({
	active,
	activeLabel,
	inactiveLabel,
	activeIcon = <LucideCheck />,
	inactiveIcon = <LucidePlus />,
	action,
}: {
	active: boolean
	activeLabel: ReactNode
	activeIcon?: ReactNode
	inactiveLabel: ReactNode
	inactiveIcon?: ReactNode
	action: (newActive: boolean) => Promise<unknown>
}) {
	return (
		<ToastActionForm action={() => action(!active)}>
			<Button
				type="submit"
				appearance="clear"
				icon={active ? activeIcon : inactiveIcon}
			>
				{active ? (
					<span className="sr-only">{activeLabel}</span>
				) : (
					<span className="sr-only">{inactiveLabel}</span>
				)}
			</Button>
		</ToastActionForm>
	)
}
