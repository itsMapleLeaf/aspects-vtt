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
import { type ComponentPropsWithoutRef, forwardRef } from "react"
import type { StrictOmit } from "../common/types.ts"
import { panel } from "./styles.ts"
import { twc } from "./twc.ts"
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

export const ModalButton = forwardRef<HTMLButtonElement, DialogDisclosureProps>((props, ref) => (
	<DialogDisclosure {...props} ref={ref} />
))

export interface ModalPanelProps extends StrictOmit<DialogProps, "backdrop" | "title"> {
	title: React.ReactNode
	description?: React.ReactNode
	className?: string
	fullHeight?: boolean
}

export function ModalPanel({
	title,
	description,
	children,
	className,
	fullHeight,
	...props
}: ModalPanelProps) {
	return (
		<Dialog
			backdrop={
				<div className="bg-black/50 opacity-0 backdrop-blur transition-opacity data-[enter]:opacity-100" />
			}
			{...props}
			className={panel(
				"fixed inset-0 m-auto flex w-[calc(100%-var(--gutter))] min-w-0 max-w-xl flex-col shadow-lg shadow-black/50  [--gutter:2rem] [--height:calc(min(100%-var(--gutter),64rem))] ",
				"translate-y-2 opacity-0 transition data-[enter]:translate-y-0 data-[enter]:opacity-100",
				fullHeight ? "h-[--height]" : "h-fit max-h-[--height]",
				className,
			)}
			unmountOnHide
		>
			<div className="flex items-center gap-3 border-b border-primary-300 bg-black/25 p-3">
				<div className="flex-1">
					<DialogHeading className="text-2xl/tight font-light">{title}</DialogHeading>
					{description && <DialogDescription>{description}</DialogDescription>}
				</div>
				<DialogDismiss className="-m-3 aspect-square p-3 opacity-50 transition-opacity hover:opacity-100">
					<LucideX />
				</DialogDismiss>
			</div>
			{children}
		</Dialog>
	)
}

export const ModalPanelContent = twc.div`min-h-0 flex-1 overflow-y-auto`

export function ModalActions(props: ComponentPropsWithoutRef<"div">) {
	return <div {...withMergedClassName(props, "flex justify-end gap-2")} />
}

export const ModalDismiss = forwardRef<HTMLButtonElement, DialogDismissProps>((props, ref) => (
	<DialogDismiss {...props} ref={ref} />
))

export function useModalContext() {
	return useDialogContext()
}
