import { twMerge, type ClassNameValue } from "tailwind-merge"

export const primaryHeading = (...classes: ClassNameValue[]) =>
	twMerge("text-2xl font-light", ...classes)

export const secondaryHeading = (...classes: ClassNameValue[]) =>
	twMerge("text-xl font-light", ...classes)

export const subText = (...classes: ClassNameValue[]) =>
	twMerge(
		"text-sm font-semibold leading-5 tracking-wide text-primary-200",
		...classes,
	)
