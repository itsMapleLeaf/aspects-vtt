import { ClassNameValue, twMerge } from "tailwind-merge"

export const container = (...classes: ClassNameValue[]) =>
	twMerge("mx-auto w-full max-w-screen-lg px-4", classes)

export const panel = (...classes: ClassNameValue[]) =>
	twMerge("rounded-lg border border-primary-600 bg-primary-700 shadow", classes)

export const heading3xl = (...classes: ClassNameValue[]) =>
	twMerge("text-3xl font-light", classes)

export const heading2xl = (...classes: ClassNameValue[]) =>
	twMerge("text-2xl font-light", classes)

export const solidButton = (...classes: ClassNameValue[]) =>
	twMerge(
		"flex min-h-10 items-center justify-center gap-1.5 rounded bg-accent-700 px-3 font-medium text-accent-50 shadow transition active:duration-0 [&:not(:disabled)]:hover:bg-accent-600 [&:not(:disabled)]:active:bg-accent-500 [&>[data-button-icon]]:size-6 [&>svg]:size-6",
		classes,
	)

export const clearButton = (...classes: ClassNameValue[]) =>
	twMerge(
		"flex min-h-10 items-center justify-center gap-1.5 rounded bg-primary-100 bg-opacity-0 px-3 transition hover:bg-opacity-10 active:bg-opacity-25 active:duration-0 [&>[data-button-icon]]:size-6 [&>svg]:size-6",
		classes,
	)

export const formLayout = (...classes: ClassNameValue[]) =>
	twMerge("flex flex-col gap-5", classes)

export const errorText = (...classes: ClassNameValue[]) =>
	twMerge("text-red-300", ...classes)
