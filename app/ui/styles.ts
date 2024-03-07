import { type ClassNameValue, twMerge } from "tailwind-merge"

export const panel = (...classes: ClassNameValue[]) =>
	twMerge("rounded border border-primary-300 bg-primary-200", classes)
