import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import type { Overwrite } from "#app/common/types.ts"

export type InputProps = Overwrite<
	ComponentPropsWithoutRef<"input">,
	{
		icon?: ReactNode
		align?: "left" | "right" | "center"
	}
>

export function Input({ icon, className, align, ...props }: InputProps) {
	return (
		<div className={twMerge("group relative flex w-full items-center", className)}>
			<div className="peer pointer-events-none absolute left-2 opacity-50 transition *:size-5 group-focus-within:opacity-100">
				{icon}
			</div>
			<input
				{...props}
				className={twMerge(
					"h-10 w-full min-w-0 rounded border border-primary-300 bg-primary-300/30 pr-3 pl-8 ring-primary-400 ring-inset transition peer-empty:pl-3 focus:outline-none focus:ring-2",
					align === "left" && "text-left",
					align === "right" && "text-right",
					align === "center" && "text-center",
				)}
			/>
		</div>
	)
}
