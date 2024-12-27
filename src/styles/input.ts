import { twMerge, type ClassNameValue } from "tailwind-merge"
import { control } from "./control.ts"

export const textInput = (...classes: ClassNameValue[]) =>
	twMerge(
		control({}),
		"block w-full min-w-0 data-error:border-red-400",
		classes,
	)

export const textArea = (...classes: ClassNameValue[]) =>
	twMerge(
		control({}),
		"block [field-sizing:content] h-auto min-h-10 w-full min-w-0 pt-2 leading-6 data-error:border-red-400",
		// compensates for the extra height added by borders
		"pb-[calc(calc(var(--spacing)*2)-2px)]",
		classes,
	)
