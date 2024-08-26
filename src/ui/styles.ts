import { ClassNameValue, twMerge } from "tailwind-merge"

export const solidButton = (...classes: ClassNameValue[]) =>
	twMerge(
		"bg-accent-700 text-accent-100 [&:not(:disabled)]:hover:bg-accent-600 [&:not(:disabled)]:active:bg-accent-500 flex min-h-10 items-center justify-center gap-1.5 rounded px-2 font-medium transition active:duration-0 [&>[data-button-icon]]:size-6 [&>svg]:size-6",
		classes,
	)

export const clearButton = (...classes: ClassNameValue[]) =>
	twMerge(
		"bg-primary-100 flex min-h-10 items-center justify-center gap-1.5 rounded bg-opacity-0 px-2 transition hover:bg-opacity-10 active:bg-opacity-25 active:duration-0 [&>[data-button-icon]]:size-6 [&>svg]:size-6",
		classes,
	)
