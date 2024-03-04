import { type ClassNameValue, twMerge } from "tailwind-merge"

export function withMergedClassName<T extends { className?: ClassNameValue }>(
	props: T,
	className?: ClassNameValue,
) {
	return { ...props, className: twMerge(className, props.className) }
}
