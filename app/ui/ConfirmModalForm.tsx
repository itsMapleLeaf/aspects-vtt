import { LucideX } from "lucide-react"
import { useState, type ComponentProps, type ReactNode } from "react"
import { useSafeAction } from "~/modules/convex/hooks.ts"
import { Button } from "~/ui/Button.tsx"
import {
	ModalActions,
	ModalDismiss,
	ModalPanel,
	ModalPanelContent,
	ModalProvider,
} from "~/ui/Modal.tsx"

export function ConfirmModalForm({
	title,
	message,
	cancelText,
	cancelIcon = <LucideX />,
	confirmText,
	confirmIcon,
	onConfirm,
	children,
	...props
}: ComponentProps<"form"> & {
	title: ReactNode
	message: ReactNode
	cancelText: ReactNode
	cancelIcon?: ReactNode
	confirmText: ReactNode
	confirmIcon: ReactNode
	onConfirm: () => unknown
}) {
	const [open, setOpen] = useState(false)

	const [, confirm] = useSafeAction(async (event: React.MouseEvent<HTMLButtonElement>) => {
		await onConfirm()
		setOpen(false)
	})

	return (
		<ModalProvider open={open} setOpen={setOpen}>
			<form {...props} action={() => setOpen(true)}>
				{children}
			</form>
			<ModalPanel title={title}>
				<ModalPanelContent className="grid place-items-center gap-2 text-pretty p-2 text-center">
					<p>{message}</p>
					<ModalActions>
						<Button icon={cancelIcon} element={<ModalDismiss />}>
							{cancelText}
						</Button>
						<Button
							icon={confirmIcon}
							type="submit"
							onClick={confirm}
							className="border-red-600/40 bg-red-600/30 before:bg-red-600/30 hover:text-red-100 active:before:bg-red-500/30"
						>
							{confirmText}
						</Button>
					</ModalActions>
				</ModalPanelContent>
			</ModalPanel>
		</ModalProvider>
	)
}
