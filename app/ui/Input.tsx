import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import type { Overwrite } from "~/common/types.ts"

export type InputProps = Overwrite<
	ComponentPropsWithoutRef<"input">,
	{
		icon?: ReactNode
	}
>

export function Input({ icon, className, ...props }: InputProps) {
	return (
		<div className={twMerge("group relative flex w-full items-center", className)}>
			<div className="peer pointer-events-none absolute left-2 opacity-50 transition *:size-5 group-focus-within:opacity-100">
				{icon}
			</div>
			<input
				{...props}
				className="h-10 w-full min-w-0 rounded border border-primary-300 bg-primary-300/30 pl-8 pr-3 ring-inset ring-primary-400 transition focus:outline-none focus:ring-2 peer-empty:pl-3"
			/>
		</div>
	)
}
