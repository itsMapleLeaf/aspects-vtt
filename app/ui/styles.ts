import { twMerge, type ClassNameValue } from "tailwind-merge"

export const panel = (...classes: ClassNameValue[]) =>
	twMerge("rounded border border-primary-300 bg-primary-200", classes)

export const translucentPanel = (...classes: ClassNameValue[]) =>
	panel("backdrop-blur bg-primary-100/75 shadow-md", ...classes)
