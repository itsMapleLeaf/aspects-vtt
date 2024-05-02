import * as Ariakit from "@ariakit/react"
import { LucideX } from "lucide-react"
import type { ComponentPropsWithoutRef } from "react"
import type { StrictOmit } from "../common/types.ts"
import { panel } from "./styles.ts"
import { twc } from "./twc.ts"
import { withMergedClassName } from "./withMergedClassName.ts"

interface ModalProps extends StrictOmit<Ariakit.DialogProviderProps, "children"> {
	children: React.ReactNode | ((store: Ariakit.DialogStore) => React.ReactNode)
}

export function Modal({ children, ...props }: ModalProps) {
	const store = Ariakit.useDialogStore()
	return (
		<Ariakit.DialogProvider store={store} {...props}>
			{typeof children === "function" ? children(store) : children}
		</Ariakit.DialogProvider>
	)
}

export const ModalButton = Ariakit.DialogDisclosure

export interface ModalPanelProps extends StrictOmit<Ariakit.DialogProps, "backdrop" | "title"> {
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
		<Ariakit.Dialog
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
					<Ariakit.DialogHeading className="text-2xl/tight font-light">
						{title}
					</Ariakit.DialogHeading>
					{description && <Ariakit.DialogDescription>{description}</Ariakit.DialogDescription>}
				</div>
				<Ariakit.DialogDismiss className="-m-3 aspect-square p-3 opacity-50 transition-opacity hover:opacity-100">
					<LucideX />
				</Ariakit.DialogDismiss>
			</div>
			{children}
		</Ariakit.Dialog>
	)
}

export const ModalPanelContent = twc.div`min-h-0 flex-1 overflow-y-auto bg-primary-100`

export function ModalActions(props: ComponentPropsWithoutRef<"div">) {
	return <div {...withMergedClassName(props, "flex justify-end gap-2")} />
}

export const ModalDismiss = Ariakit.DialogDismiss

export function useModalContext() {
	return Ariakit.useDialogContext()
}
