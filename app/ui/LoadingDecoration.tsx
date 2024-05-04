import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import { Loading } from "./Loading.tsx"

export interface LoadingDecorationProps extends ComponentProps<"div"> {
	pending: boolean
}

export function LoadingDecoration({ pending, children, ...props }: LoadingDecorationProps) {
	return (
		<div {...props} className={twMerge(props.className, "relative")}>
			{children}
			<div
				data-pending={pending}
				className="flex-center pointer-events-none absolute inset-y-0 right-0 aspect-square opacity-0 data-[pending=true]:opacity-50"
			>
				<Loading size="sm" className="p-0" />
			</div>
		</div>
	)
}
