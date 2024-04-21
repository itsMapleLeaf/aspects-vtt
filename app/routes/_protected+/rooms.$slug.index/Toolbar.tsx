import * as Ariakit from "@ariakit/react"
import { usePopoverStore } from "@ariakit/react"
import * as Lucide from "lucide-react"
import { type RefObject, createContext, use, useRef, useState } from "react"
import { twMerge } from "tailwind-merge"
import { Button } from "#app/ui/Button.js"
import { Popover, PopoverPanel, PopoverTrigger } from "#app/ui/Popover.js"
import { Tooltip, type TooltipProps } from "#app/ui/Tooltip.js"

const ToolbarContext = createContext<{
	ref: RefObject<HTMLDivElement>
	popoverId: string | undefined
	open: (id: string) => void
	close: () => void
}>({
	ref: { current: null },
	popoverId: undefined,
	open: () => {},
	close: () => {},
})

export function Toolbar(props: { children: React.ReactNode }) {
	const ref = useRef<HTMLDivElement>(null)
	const [popoverId, setPopoverId] = useState<string>()
	return (
		<nav aria-label="Toolbar" ref={ref} className="flex gap-1 p-1">
			<ToolbarContext.Provider
				value={{ ref, popoverId, open: setPopoverId, close: () => setPopoverId(undefined) }}
			>
				{props.children}
			</ToolbarContext.Provider>
		</nav>
	)
}
function toolbarButtonStyle(className?: string) {
	return twMerge(
		"flex-center rounded p-2 text-primary-900 opacity-50 transition *:size-6  hover:bg-primary-100 hover:opacity-100",
		className,
	)
}
export function ToolbarButton({ icon, ...props }: TooltipProps & { icon: React.ReactNode }) {
	return (
		<Tooltip placement="bottom" {...props} className={toolbarButtonStyle(props.className)}>
			{icon}
		</Tooltip>
	)
}
export function ToolbarPopoverButton(props: {
	id: string
	text: string
	icon: React.ReactNode
	children: React.ReactNode
}) {
	const context = use(ToolbarContext)

	const popoverStore = usePopoverStore({
		open: context.popoverId === props.id,
		setOpen: (open) => (open ? context.open(props.id) : context.close()),
	})

	return (
		<Popover placement="bottom" store={popoverStore}>
			<PopoverTrigger
				render={({ ref, ...rest }) => <ToolbarButton {...rest} {...props} buttonRef={ref} />}
			/>
			<PopoverPanel
				gutter={8}
				autoFocusOnShow={false}
				autoFocusOnHide={false}
				hideOnInteractOutside={false}
				getAnchorRect={() => context.ref.current?.getBoundingClientRect() ?? null}
				className="relative max-h-[calc(100dvh-2rem)] w-[360px] bg-primary-100/75 backdrop-blur-sm"
			>
				{props.children}
				<Button
					icon={<Lucide.X />}
					title="Close"
					onClick={() => context.close()}
					className="absolute inset-y-0 left-[calc(100%+0.5rem)] my-auto aspect-square opacity-50 hover:opacity-100"
				/>
			</PopoverPanel>
		</Popover>
	)
}
export function ToolbarDialogButton({
	children,
	store,
	defaultOpen,
	...props
}: {
	text: string
	icon: React.ReactNode
	children: React.ReactNode
	store?: Ariakit.DialogStore
	defaultOpen?: boolean
}) {
	return (
		<Ariakit.DialogProvider store={store} defaultOpen={store ? undefined : defaultOpen}>
			<Ariakit.DialogDisclosure
				render={({ ref, ...rest }) => <ToolbarButton {...rest} {...props} buttonRef={ref} />}
			/>
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
