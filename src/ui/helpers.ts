import { twMerge } from "tailwind-merge"

export function mergeClassProp<Props extends { className?: string }>(
	props: Props,
	className: string,
) {
	return { ...props, className: twMerge(props.className, className) }
}
