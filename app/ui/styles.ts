import { type ClassNameValue, twMerge } from "tailwind-merge"

export const panel = (...classes: ClassNameValue[]) =>
	twMerge("rounded border border-primary-700 bg-primary-800", classes)

export const translucentPanel = (...classes: ClassNameValue[]) =>
	panel("backdrop-blur bg-primary-900/75 shadow-md", ...classes)
