import {
	Dialog,
	DialogDescription,
	DialogDisclosure,
	type DialogDisclosureProps,
	DialogDismiss,
	type DialogDismissProps,
	DialogHeading,
	type DialogProps,
	DialogProvider,
	type DialogProviderProps,
	type DialogStore,
	useDialogContext,
	useDialogStore,
} from "@ariakit/react"
import { LucideX } from "lucide-react"
import type { ComponentPropsWithoutRef } from "react"
import { raise } from "#app/common/errors.ts"
import type { StrictOmit } from "#app/common/types.ts"
import { panel } from "./styles.ts"
import { withMergedClassName } from "./withMergedClassName.ts"

interface ModalProps extends StrictOmit<DialogProviderProps, "children"> {
	children: React.ReactNode | ((store: DialogStore) => React.ReactNode)
}

export function Modal({ children, ...props }: ModalProps) {
	const store = useDialogStore()
	return (
		<DialogProvider store={store} {...props}>
			{typeof children === "function" ? children(store) : children}
		</DialogProvider>
	)
}

export function ModalButton(props: DialogDisclosureProps) {
	return <DialogDisclosure {...props} />
}

export interface ModalPanelProps
	extends StrictOmit<DialogProps, "backdrop" | "title"> {
	title: React.ReactNode
	description?: React.ReactNode
}

export function ModalPanel({
	title,
	description,
	children,
	...props
}: ModalPanelProps) {
	const store =
		useDialogContext() ??
		raise(
			`<${ModalPanel.name} /> must be used within a <${Modal.name} />`,
			ModalPanel,
		)

	return (
		<Dialog
			{...props}
			backdrop={<div className="bg-black/50 backdrop-blur" />}
			className="fixed inset-0 flex flex-col overflow-y-auto"
			onClick={(event) => {
				if (event.target === event.currentTarget) store.hide()
			}}
		>
			<div className={panel("m-auto divide-y divide-primary-300 shadow-lg")}>
				<header className="flex items-center gap-3 bg-black/25 p-3">
					<div className="flex-1">
						<DialogHeading className="font-light text-2xl/tight">
							{title}
						</DialogHeading>
						{description && (
							<DialogDescription>{description}</DialogDescription>
						)}
					</div>
					<DialogDismiss className="-m-3 aspect-square p-3 opacity-50 transition-opacity hover:opacity-100">
						<LucideX />
					</DialogDismiss>
				</header>
				<main className="flex flex-col gap-3 p-3">{children}</main>
			</div>
		</Dialog>
	)
}

export function ModalActions(props: ComponentPropsWithoutRef<"div">) {
	return <div {...withMergedClassName(props, "flex justify-end gap-2")} />
}

export function ModalDismiss(props: DialogDismissProps) {
	return <DialogDismiss {...props} />
}
