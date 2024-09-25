import { type ClassNameValue, twMerge } from "tailwind-merge"

export const panel = (...classes: ClassNameValue[]) =>
	twMerge("rounded-md border border-primary-700 bg-primary-800", ...classes)

export const lightPanel = (...classes: ClassNameValue[]) =>
	twMerge(panel(), "border-primary-600 bg-primary-700", classes)

export const interactivePanel = (...classes: ClassNameValue[]) =>
	twMerge(
		lightPanel(),
		"transition hover:border-primary-500 active:duration-0",
		classes,
	)
