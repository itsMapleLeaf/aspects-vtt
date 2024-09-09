import { twMerge, type ClassNameValue } from "tailwind-merge"

export const heading = (...classes: ClassNameValue[]) =>
	twMerge("text-2xl font-light", classes)
