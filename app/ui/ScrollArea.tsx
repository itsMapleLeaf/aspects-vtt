import * as RadixScrollArea from "@radix-ui/react-scroll-area"
import { twMerge } from "tailwind-merge"

export interface ScrollAreaProps {
	children: React.ReactNode
	className?: string
	scrollbarPosition?: "outside" | "inside"
	scrollbarGap?: number
	wheelDirection?: "vertical" | "horizontal"
	viewportRef?: React.Ref<HTMLDivElement>
	onViewportScroll?: (event: React.UIEvent<HTMLDivElement>) => void
}

export function ScrollArea(props: ScrollAreaProps) {
	return (
		<RadixScrollArea.Root className={twMerge("flex h-full flex-col", props.className)}>
			<RadixScrollArea.Viewport
				className="min-h-0 flex-1 [&>div]:!block"
				ref={props.viewportRef}
				onScroll={props.onViewportScroll}
				onWheel={(event) => {
					if (props.wheelDirection === "horizontal") {
						event.preventDefault()
						event.currentTarget.scrollBy(event.deltaY, 0)
					}
				}}
			>
				{props.children}
			</RadixScrollArea.Viewport>

			<RadixScrollArea.Scrollbar
				orientation="vertical"
				style={{ transform: `translateX(${props.scrollbarGap ?? 0}px)` }}
				className={twMerge(
					"relative ml-0.5 flex w-2.5 px-0.5",
					props.scrollbarPosition === "outside" ? "left-full" : "",
				)}
			>
				<RadixScrollArea.Thumb className="relative flex-1 rounded-full bg-primary-600 opacity-50 transition-opacity active:opacity-100 active:duration-0" />
			</RadixScrollArea.Scrollbar>

			<RadixScrollArea.Scrollbar
				orientation="horizontal"
				style={{ transform: `translateY(${props.scrollbarGap ?? 0}px)` }}
				className={twMerge(
					"relative mt-0.5 flex h-2.5 flex-col py-0.5",
					props.scrollbarPosition === "outside" ? "top-full" : "",
				)}
			>
				<RadixScrollArea.Thumb className="relative flex-1 rounded-full bg-primary-600 opacity-50 transition-opacity active:opacity-100 active:duration-0" />
			</RadixScrollArea.Scrollbar>
		</RadixScrollArea.Root>
	)
}
