import { type ClassNameValue, twMerge } from "tailwind-merge"

export const panel = (...classes: ClassNameValue[]) =>
	twMerge("rounded border border-primary-700 bg-primary-800", ...classes)
