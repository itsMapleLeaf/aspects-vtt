import { twMerge } from "tailwind-merge"
import { StrictOmit } from "../../lib/types.ts"
import { mergeClassProp } from "./helpers.ts"
import { Slot, SlotProps } from "./slot.tsx"

export interface LayoutComponentProps
	extends StrictOmit<SlotProps, "content">,
		LayoutProps {}

export function Row(props: LayoutComponentProps) {
	return <Slot {...mergeClassProp(withLayoutClass(props), "flex gap-4")} />
}

export function Column(props: LayoutComponentProps) {
	return (
		<Slot {...mergeClassProp(withLayoutClass(props), "flex flex-col gap-4")} />
	)
}

interface LayoutProps {
	items?: "start" | "center" | "end" | "stretch"
	justify?: "start" | "center" | "end" | "between" | "around"
	content?: "start" | "center" | "end" | "stretch"
}

const itemsClasses = {
	start: "items-start",
	center: "items-center",
	end: "items-end",
	stretch: "items-stretch",
}

const justifyClasses = {
	start: "justify-start",
	center: "justify-center",
	end: "justify-end",
	between: "justify-between",
	around: "justify-around",
}

const contentClasses = {
	start: "content-start",
	center: "content-center",
	end: "content-end",
	stretch: "content-stretch",
}

function withLayoutClass<T extends LayoutProps & { className?: string }>({
	items,
	justify,
	content,
	className,
	...props
}: T) {
	return {
		...props,
		className: twMerge(
			itemsClasses[items || "start"],
			justifyClasses[justify || "start"],
			contentClasses[content || "start"],
			className,
		),
	}
}
