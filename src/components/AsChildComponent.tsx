import { Slot } from "@radix-ui/react-slot"
import { twMerge, type ClassNameValue } from "tailwind-merge"
import type { StrictOmit } from "~/common/types.ts"

export interface AsChildParentProps
	extends StrictOmit<React.HTMLAttributes<HTMLElement>, "className"> {
	asChild?: boolean
	className?: ClassNameValue
}

export interface AsChildComponentProps extends AsChildParentProps {
	fallbackTag?: React.ElementType
	baseClass?: ClassNameValue
}

export function AsChildComponent({
	fallbackTag = "div",
	baseClass,
	...props
}: AsChildComponentProps) {
	const Comp = props.asChild ? Slot : fallbackTag
	return <Comp {...props} className={twMerge(baseClass, props.className)} />
}
