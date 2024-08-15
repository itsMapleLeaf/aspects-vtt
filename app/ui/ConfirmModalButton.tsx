import { LucideX } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import { ConfirmModal } from "./ConfirmModal.tsx"
import { ModalButton } from "./Modal.tsx"

export function ConfirmModalButton({
	title,
	message,
	cancelText,
	cancelIcon = <LucideX />,
	confirmText,
	confirmIcon,
	onConfirm,
	dangerous,
	...props
}: ComponentProps<typeof ModalButton> & {
	title: ReactNode
	message: ReactNode
	cancelText: ReactNode
	cancelIcon?: ReactNode
	confirmText: ReactNode
	confirmIcon: ReactNode
	dangerous?: boolean
	onConfirm: () => unknown
}) {
	return (
		<ConfirmModal
			title={title}
			message={message}
			cancelText={cancelText}
			cancelIcon={cancelIcon}
			confirmText={confirmText}
			confirmIcon={confirmIcon}
			onConfirm={onConfirm}
			dangerous={dangerous}
		>
			<ModalButton {...props} />
		</ConfirmModal>
	)
}
