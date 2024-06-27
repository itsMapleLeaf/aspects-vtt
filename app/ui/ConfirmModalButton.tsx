import { type ComponentProps, type ReactNode, useState } from "react"
import { useSafeAction } from "~/modules/convex/hooks.ts"
import { Button } from "./Button.tsx"
import {
	ModalActions,
	ModalButton,
	ModalDismiss,
	ModalPanel,
	ModalPanelContent,
	ModalProvider,
} from "./Modal.tsx"

export function ConfirmModalButton({
	title,
	message,
	cancelText,
	cancelIcon,
	confirmText,
	confirmIcon,
	onConfirm,
	...props
}: ComponentProps<typeof ModalButton> & {
	title: ReactNode
	message: ReactNode
	cancelText: ReactNode
	cancelIcon: ReactNode
	confirmText: ReactNode
	confirmIcon: ReactNode
	onConfirm: () => unknown
}) {
	const [open, setOpen] = useState(false)

	const [, action] = useSafeAction(async (event: React.MouseEvent<HTMLButtonElement>) => {
		await onConfirm()
		setOpen(false)
	})

	return (
		<ModalProvider open={open} setOpen={setOpen}>
			<ModalButton {...props} />
			<ModalPanel title={title}>
				<ModalPanelContent className="grid place-items-center gap-2 text-pretty p-2 text-center">
					<p>{message}</p>
					<ModalActions>
						<Button icon={cancelIcon} text={cancelText} element={<ModalDismiss />} />
						<Button
							icon={confirmIcon}
							text={confirmText}
							type="submit"
							onClick={action}
							className="border-red-600/40 bg-red-600/30 before:bg-red-600/30 hover:text-red-100 active:before:bg-red-500/30"
						/>
					</ModalActions>
				</ModalPanelContent>
			</ModalPanel>
		</ModalProvider>
	)
}
