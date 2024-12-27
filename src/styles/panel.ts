import { type ClassNameValue, twMerge } from "tailwind-merge"

export const panel = (...classes: ClassNameValue[]) =>
	twMerge("border-primary-700 bg-primary-800 rounded-md border", ...classes)

export const lightPanel = (...classes: ClassNameValue[]) =>
	twMerge(panel(), "border-primary-600 bg-primary-700", classes)

export const interactivePanel = (...classes: ClassNameValue[]) =>
	twMerge(
		lightPanel(),
		"hover:border-primary-500 active:border-primary-400 transition active:duration-0",
		classes,
	)
