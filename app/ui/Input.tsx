import type { ComponentPropsWithoutRef, ReactElement } from "react"
import { twMerge } from "tailwind-merge"
import type { Overwrite } from "~/common/types.ts"

export type InputProps = Overwrite<
	ComponentPropsWithoutRef<"input">,
	{
		icon: ReactElement | undefined
	}
>

export function Input({ icon, className, ...props }: InputProps) {
	return (
		<div className={twMerge("group relative flex items-center", className)}>
			<input
				{...props}
				className="h-10 w-full min-w-0 rounded border border-primary-300 bg-primary-300/30 pl-8 pr-3 ring-primary-400 transition focus:outline-none focus:ring-2"
			/>
			<div className="pointer-events-none absolute left-2 opacity-50 transition *:size-5 group-focus-within:opacity-100">
				{icon}
			</div>
		</div>
	)
}
