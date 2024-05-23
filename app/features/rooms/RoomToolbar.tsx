import * as Ariakit from "@ariakit/react"
import * as React from "react"
import { type ClassNameValue, twMerge } from "tailwind-merge"
import { Popover, PopoverPanel, PopoverTrigger } from "../../ui/Popover.tsx"
import { Tooltip } from "../../ui/Tooltip.tsx"

export function Toolbar(props: { children: React.ReactNode }) {
	return (
		<nav aria-label="Toolbar" className="flex gap-1 p-1">
			{props.children}
		</nav>
	)
}

function toolbarButtonStyle(...classes: ClassNameValue[]) {
	return twMerge(
		"flex-center rounded p-2 text-primary-900 opacity-50 transition *:size-6 hover:opacity-75",
		...classes,
	)
}

export interface ToolbarButtonProps extends React.ComponentPropsWithoutRef<"button"> {
	text: string
	icon: React.ReactNode
	active?: boolean
}

export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
	function ToolbarButton({ text, icon, active, ...props }, ref) {
		return (
			<Tooltip content={text} placement="bottom">
				<button
					type="button"
					className={toolbarButtonStyle(active && "text-primary-700 opacity-100", props.className)}
					{...props}
					ref={ref}
				>
					{icon}
				</button>
			</Tooltip>
		)
	},
)

export function ToolbarPopoverButton(props: {
	id: string
	text: string
	icon: React.ReactNode
	children: React.ReactNode
}) {
	return (
		<Popover placement="bottom">
			<PopoverTrigger render={<ToolbarButton icon={props.icon} text={props.text} />} />
			<PopoverPanel
				gutter={24}
				autoFocusOnShow={false}
				autoFocusOnHide={false}
				className="relative max-h-[calc(100dvh-8rem)] w-[400px] overflow-y-auto bg-primary-100/75 backdrop-blur-sm"
			>
				{props.children}
			</PopoverPanel>
		</Popover>
	)
}

export function ToolbarDialogButton({
	children,
	store,
	defaultOpen,
	icon,
	text,
}: {
	text: string
	icon: React.ReactNode
	children: React.ReactNode
	store?: Ariakit.DialogStore
	defaultOpen?: boolean
}) {
	return (
		<Ariakit.DialogProvider store={store} defaultOpen={store ? undefined : defaultOpen}>
			<Ariakit.DialogDisclosure render={<ToolbarButton icon={icon} text={text} />} />
			{children}
		</Ariakit.DialogProvider>
	)
}

export function ToolbarDialogContent(props: Ariakit.DialogProps) {
	return (
		<Ariakit.Dialog portal modal={false} hideOnInteractOutside={false} unmountOnHide {...props} />
	)
}

export function ToolbarSeparator() {
	return (
		<div className="shrink-0 basis-px self-stretch bg-primary-300/75 first:hidden last:hidden" />
	)
}
