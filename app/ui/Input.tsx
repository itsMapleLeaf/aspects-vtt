import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { omit } from "#app/common/object.js"
import type { Overwrite } from "#app/common/types.ts"

export type InputProps = Overwrite<
	| (ComponentPropsWithoutRef<"input"> & { multiline?: false | undefined })
	| (ComponentPropsWithoutRef<"textarea"> & { multiline: true }),
	{
		icon?: ReactNode
		align?: "left" | "right" | "center"
	}
>

export function Input({ icon, className, align, ...props }: InputProps) {
	const inputClassNameBase = twMerge(
		"w-full min-w-0 rounded border border-primary-300 bg-primary-300/30 pr-3 pl-8 transition peer-empty:pl-3",
		align === "left" && "text-left",
		align === "right" && "text-right",
		align === "center" && "text-center",
	)
	return (
		<div className={twMerge("group relative flex w-full items-center", className)}>
			<div className="peer pointer-events-none absolute left-2 opacity-50 transition *:size-5 group-focus-within:opacity-100">
				{icon}
			</div>
			{props.multiline ? (
				<textarea
					rows={3}
					{...omit(props, ["multiline"])}
					className={twMerge(inputClassNameBase, "py-1.5 leading-7")}
				/>
			) : (
				<input {...omit(props, ["multiline"])} className={twMerge(inputClassNameBase, "h-10")} />
			)}
		</div>
	)
}
