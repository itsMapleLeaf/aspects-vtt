import * as RadixScrollArea from "@radix-ui/react-scroll-area"
import { twMerge } from "tailwind-merge"

export interface ScrollAreaProps {
	children: React.ReactNode
	className?: string
	scrollbarPosition?: "outside" | "inside"
}

export function ScrollArea(props: ScrollAreaProps) {
	return (
		<RadixScrollArea.Root className={twMerge("h-full", props.className)}>
			<RadixScrollArea.Viewport className="max-h-full">{props.children}</RadixScrollArea.Viewport>
			<RadixScrollArea.Scrollbar
				orientation="vertical"
				className={twMerge(
					"relative ml-0.5 flex w-2.5 p-0.5",
					props.scrollbarPosition === "inside" ? "" : "left-full",
				)}
			>
				<RadixScrollArea.Thumb className="relative flex-1 rounded-full bg-primary-600 opacity-50 transition-opacity active:opacity-100 active:duration-0" />
			</RadixScrollArea.Scrollbar>
			<RadixScrollArea.Corner />
		</RadixScrollArea.Root>
	)
}
