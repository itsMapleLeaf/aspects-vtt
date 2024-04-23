import * as RadixScrollArea from "@radix-ui/react-scroll-area"
import { twMerge } from "tailwind-merge"

export interface ScrollAreaProps {
	children: React.ReactNode
	className?: string
}

export function ScrollArea(props: ScrollAreaProps) {
	return (
		<RadixScrollArea.Root className={twMerge("h-full", props.className)}>
			<RadixScrollArea.Viewport className="size-full">{props.children}</RadixScrollArea.Viewport>
			<RadixScrollArea.Scrollbar
				orientation="vertical"
				className="relative left-full ml-0.5 flex w-2.5 p-0.5"
			>
				<RadixScrollArea.Thumb className="relative flex-1 rounded-full bg-primary-600 opacity-50 transition-opacity active:opacity-100 active:duration-0" />
			</RadixScrollArea.Scrollbar>
			<RadixScrollArea.Corner />
		</RadixScrollArea.Root>
	)
}
