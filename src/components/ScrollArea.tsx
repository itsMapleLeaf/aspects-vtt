import {
	Corner,
	Root,
	Scrollbar,
	Thumb,
	Viewport,
} from "@radix-ui/react-scroll-area"
import { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"

export const ScrollArea = ({
	children,
	...props
}: ComponentProps<typeof Root>) => (
	<Root
		{...props}
		className={twMerge("size-full min-h-0 min-w-0 rounded-sm", props.className)}
	>
		<Viewport className="size-full min-h-0 min-w-0 overflow-clip rounded-[inherit]">
			{children}
		</Viewport>
		<Scrollbar
			className="flex touch-none p-0.5 select-none data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:flex-col data-[orientation=vertical]:w-2"
			orientation="vertical"
		>
			<Thumb className="bg-primary-300 relative flex-1 rounded-full opacity-60 transition-opacity before:absolute before:top-1/2 before:left-1/2 before:size-full before:min-h-11 before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2 hover:opacity-80 active:opacity-100 active:duration-0" />
		</Scrollbar>
		<Scrollbar
			className="flex touch-none p-0.5 select-none data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:flex-col data-[orientation=vertical]:w-2"
			orientation="horizontal"
		>
			<Thumb className="bg-primary-300 relative flex-1 rounded-full opacity-60 transition-opacity before:absolute before:top-1/2 before:left-1/2 before:size-full before:min-h-[44px] before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 hover:opacity-80 active:opacity-100 active:duration-0" />
		</Scrollbar>
		<Corner />
	</Root>
)
