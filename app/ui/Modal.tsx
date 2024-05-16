import * as Ariakit from "@ariakit/react"
import { LucideX } from "lucide-react"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { StrictOmit } from "../common/types.ts"
import { Button, type ButtonPropsAsButton } from "./Button.tsx"
import { panel } from "./styles.ts"
import { twc } from "./twc.ts"
import { withMergedClassName } from "./withMergedClassName.ts"

interface ModalBaseProps {
	children?: ReactNode
	title: React.ReactNode
	description?: React.ReactNode
	fullHeight?: boolean
}

interface ModalAsButtonProps extends ModalBaseProps, StrictOmit<ButtonPropsAsButton, "title"> {}

interface ModalWithTriggerProps extends ModalBaseProps {
	trigger: React.ReactElement
}

type ModalProps = ModalAsButtonProps | ModalWithTriggerProps

/**
 * @example
 * // using built-in button
 * <Modal title="Delete Character" text="Delete Character" icon={<LucideTrash />}>
 * 	<p>Are you sure you want to delete this character?</p>
 *    <ModalActions>
 * 		<ModalDismiss>Cancel</ModalDismiss>
 * 		<Button type="submit">Delete</Button>
 *    </ModalActions>
 * </Modal>
 *
 * // using custom button
 * <Modal title="Delete Character" trigger={<DeleteButton />}>
 * 	<p>Are you sure you want to delete this character?</p>
 *    <ModalActions>
 * 		<ModalDismiss>Cancel</ModalDismiss>
 * 		<Button type="submit">Delete</Button>
 *    </ModalActions>
 * </Modal>
 */
export function Modal({ children, title, description, fullHeight, ...props }: ModalProps) {
	return (
		<ModalProvider>
			<ModalButton render={"trigger" in props ? props.trigger : <Button {...props} />} />
			<ModalPanel title={title} description={description} fullHeight={fullHeight}>
				<ModalPanelContent>{children}</ModalPanelContent>
			</ModalPanel>
		</ModalProvider>
	)
}

export interface ModalProviderProps extends StrictOmit<Ariakit.DialogProviderProps, "children"> {
	children: React.ReactNode | ((store: Ariakit.DialogStore) => React.ReactNode)
}

export function ModalProvider({ children, ...props }: ModalProviderProps) {
	const store = Ariakit.useDialogStore()
	return (
		<Ariakit.DialogProvider store={store} {...props}>
			{typeof children === "function" ? children(store) : children}
		</Ariakit.DialogProvider>
	)
}

export function ModalButton(props: Ariakit.DisclosureProps) {
	return <Ariakit.DialogDisclosure {...props} />
}

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
				"fixed bg-primary-100 inset-0 m-auto flex w-[calc(100%-var(--gutter))] min-w-0 max-w-xl flex-col shadow-lg shadow-black/50  [--gutter:2rem] [--height:calc(min(100%-var(--gutter),64rem))] ",
				"translate-y-2 opacity-0 transition data-[enter]:translate-y-0 data-[enter]:opacity-100",
				fullHeight ? "h-[--height]" : "h-fit max-h-[--height]",
				className,
			)}
			unmountOnHide
		>
			<div className="flex items-center gap-3 border-b border-primary-300 bg-black/25 bg-primary-200 p-3">
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
