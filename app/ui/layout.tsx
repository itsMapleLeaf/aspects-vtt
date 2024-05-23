import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import { renderElementProp, type ElementProp } from "../common/ElementProp.tsx"

interface ColumnPropsBase {
	gap?: 1 | 2 | 3 | 4 | 6
}

interface ColumnPropsAsDiv extends ColumnPropsBase, ComponentProps<"div"> {
	element?: undefined
}

interface ColumnPropsAsElement extends ColumnPropsBase, Record<keyof ComponentProps<"div">, never> {
	element: ElementProp<ComponentProps<"div">>
}

export type ColumnProps = ColumnPropsAsDiv | ColumnPropsAsElement

export function Column({ gap = 4, element = <div />, ...props }: ColumnProps) {
	return renderElementProp(element, {
		...props,
		className: twMerge("flex flex-col gap-[--gap]", props.className),
		style: {
			"--gap": `${gap * 0.25}rem`,
			...props.style,
		} as React.CSSProperties,
	})
}
