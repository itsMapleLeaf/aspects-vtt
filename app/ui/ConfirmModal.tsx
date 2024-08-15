import { LucideX } from "lucide-react"
import {
	type ComponentProps,
	type ReactNode,
	isValidElement,
	useState,
} from "react"
import { useSafeAction } from "~/modules/convex/hooks.ts"
import { Button } from "~/ui/Button.tsx"
import {
	ModalActions,
	ModalButton,
	ModalDismiss,
	ModalPanel,
	ModalPanelContent,
	ModalProvider,
} from "~/ui/Modal.tsx"

export function ConfirmModal({
	title,
	message,
	cancelText,
	cancelIcon = <LucideX />,
	confirmText,
	confirmIcon,
	onConfirm,
	children,
	dangerous = true,
	...props
}: ComponentProps<typeof ModalProvider> & {
	title: ReactNode
	message: ReactNode
	cancelText: ReactNode
	cancelIcon?: ReactNode
	confirmText: ReactNode
	confirmIcon: ReactNode
	children: React.ReactNode
	dangerous?: boolean
	onConfirm: () => unknown
}) {
	const [open, setOpen] = useState(false)

	const [, confirm] = useSafeAction(
		async (event: React.MouseEvent<HTMLButtonElement>) => {
			await onConfirm()
			if (props.setOpen) {
				props.setOpen(false)
			} else {
				setOpen(false)
			}
		},
	)

	return (
		<ModalProvider {...props} open={props.open ?? open} setOpen={setOpen}>
			{children}
			<ModalPanel title={title}>
				<ModalPanelContent className="grid place-items-center text-pretty p-4 text-center gap-4">
					{isValidElement(message) ?
						<div className="text-lg">{message}</div>
					:	<p>{message}</p>}
					<ModalActions>
						<Button
							icon={cancelIcon}
							element={<ModalDismiss />}
							appearance={dangerous ? "solid" : "clear"}
						>
							{cancelText}
						</Button>
						<Button
							icon={confirmIcon}
							type="submit"
							onClick={confirm}
							className={
								dangerous ?
									"border-red-600/40 bg-red-600/30 before:bg-red-600/30 hover:text-red-100 active:before:bg-red-500/30"
								:	""
							}
						>
							{confirmText}
						</Button>
					</ModalActions>
				</ModalPanelContent>
			</ModalPanel>
		</ModalProvider>
	)
}

ConfirmModal.Button = ModalButton
