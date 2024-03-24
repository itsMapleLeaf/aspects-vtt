import { omit } from "#app/common/object.js"
import type { Overwrite } from "#app/common/types.ts"
import type React from "react"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { panel } from "./styles.ts"

export type InputProps = Overwrite<
	| (ComponentPropsWithoutRef<"input"> & {
			multiline?: false | undefined
			elementRef?: React.Ref<HTMLInputElement>
	  })
	| (ComponentPropsWithoutRef<"textarea"> & {
			multiline: true
			elementRef?: React.Ref<HTMLTextAreaElement>
	  }),
	{
		icon?: ReactNode
		align?: "left" | "right" | "center"
	}
>

export function Input({ icon, className, align, ...props }: InputProps) {
	const inputClassNameBase = panel(
		twMerge(
			"w-full min-w-0 rounded border border-primary-300 bg-primary-200 pl-8 pr-3 transition peer-empty:pl-3",
			align === "left" && "text-left",
			align === "right" && "text-right",
			align === "center" && "text-center",
		),
	)
	return (
		<div className={twMerge("group relative flex w-full items-center", className)}>
			<div className="peer pointer-events-none absolute left-2 opacity-50 transition *:size-5 group-focus-within:opacity-100">
				{icon}
			</div>
			{props.multiline ?
				<textarea
					rows={3}
					{...omit(props, ["multiline", "elementRef"])}
					className={twMerge(inputClassNameBase, "py-1.5 leading-7")}
					ref={props.elementRef}
				/>
			:	<input
					{...omit(props, ["multiline", "elementRef"])}
					className={twMerge(inputClassNameBase, "h-10")}
					ref={props.elementRef}
				/>
			}
		</div>
	)
}
