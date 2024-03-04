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
		<div className={twMerge("relative flex items-center group", className)}>
			<input
				{...props}
				className="border border-primary-300 bg-primary-300/30 focus:ring-2 ring-primary-400 pl-8 focus:outline-none h-10 pr-3 rounded transition w-full min-w-0"
			/>
			<div className="absolute left-2 *:size-5 opacity-50 group-focus-within:opacity-100 transition pointer-events-none">
				{icon}
			</div>
		</div>
	)
}
