import { twMerge, type ClassNameValue } from "tailwind-merge"

export function withMergedClassName<T extends { className?: ClassNameValue }>(
	props: T,
	...classes: ClassNameValue[]
) {
	return { ...props, className: twMerge(...classes, props.className) }
}
