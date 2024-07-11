import { twMerge } from "tailwind-merge"

export function mergeClassProp<Props extends { className?: string }>(
	props: Props,
	...baseClasses: string[]
) {
	return { ...props, className: twMerge(baseClasses, props.className) }
}
