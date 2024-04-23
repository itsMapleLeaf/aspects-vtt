import * as Ariakit from "@ariakit/react"
import * as React from "react"
import { twMerge } from "tailwind-merge"
import { Popover, PopoverPanel, PopoverTrigger } from "#app/ui/Popover.js"
import { Tooltip } from "#app/ui/Tooltip.js"

export function Toolbar(props: { children: React.ReactNode }) {
	return (
		<nav aria-label="Toolbar" className="flex gap-1 p-1">
			{props.children}
		</nav>
	)
}

function toolbarButtonStyle(className?: string) {
	return twMerge(
		"flex-center rounded p-2 text-primary-900 opacity-50 transition *:size-6  hover:bg-primary-100 hover:opacity-100",
		className,
	)
}

export interface ToolbarButtonProps extends React.ComponentPropsWithoutRef<"button"> {
	text: string
	icon: React.ReactNode
}

export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
	function ToolbarButton({ text, icon, ...props }, ref) {
		return (
			<Tooltip content={text} placement="bottom">
				<button type="button" className={toolbarButtonStyle(props.className)} {...props} ref={ref}>
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
				className="relative max-h-[calc(100dvh-8rem)] w-[360px] overflow-y-auto bg-primary-100/75 backdrop-blur-sm"
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