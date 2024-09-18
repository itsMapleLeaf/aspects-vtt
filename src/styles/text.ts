import { twMerge, type ClassNameValue } from "tailwind-merge"

export const primaryHeading = (...classes: ClassNameValue[]) =>
	twMerge("text-3xl font-light", ...classes)

export const secondaryHeading = (...classes: ClassNameValue[]) =>
	twMerge("text-2xl font-light", ...classes)
