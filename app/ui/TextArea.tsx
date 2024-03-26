import type React from "react"
import type { ReactNode } from "react"
import TextAreaAutosize, { type TextareaAutosizeProps } from "react-textarea-autosize"
import { twMerge } from "tailwind-merge"
import { type InputStyleProps, inputStyle } from "./Input.tsx"

export interface TextAreaProps extends TextareaAutosizeProps, InputStyleProps {
	elementRef?: React.Ref<HTMLTextAreaElement>
	icon?: ReactNode
}

export function TextArea({ icon, className, align, elementRef, ...props }: TextAreaProps) {
	return (
		<div className={twMerge("group relative flex w-full items-center", className)}>
			<div className="peer pointer-events-none absolute left-2 opacity-50 transition *:size-5 group-focus-within:opacity-100">
				{icon}
			</div>
			<TextAreaAutosize
				minRows={3}
				{...props}
				className={inputStyle({ align }, "py-1.5 leading-7")}
				ref={elementRef}
			/>
		</div>
	)
}
