import { twMerge, type ClassNameValue } from "tailwind-merge"

export const primaryHeading = (...classes: ClassNameValue[]) =>
	twMerge("text-2xl font-light", ...classes)

export const secondaryHeading = (...classes: ClassNameValue[]) =>
	twMerge("text-xl font-light", ...classes)

export const subText = (...classes: ClassNameValue[]) =>
	twMerge(
		"text-primary-200 text-sm leading-5 font-semibold tracking-wide",
		...classes,
	)
