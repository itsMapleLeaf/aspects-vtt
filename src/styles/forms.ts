import { ClassNameValue, twMerge } from "tailwind-merge"

export const formField = (...classes: ClassNameValue[]) =>
	twMerge("flex flex-col gap-0.5", ...classes)

export const labelText = (...classes: ClassNameValue[]) =>
	twMerge("text-sm font-semibold tracking-wide", ...classes)

export const errorText = (...classes: ClassNameValue[]) =>
	twMerge("text-sm font-semibold text-red-400", ...classes)

export const formRow = (...classes: ClassNameValue[]) =>
	twMerge("grid auto-cols-fr gap md:grid-flow-col", classes)
