import { ComponentProps } from "react"
import { mergeClassProp } from "./helpers.ts"

export function Row(props: ComponentProps<"div">) {
	return <div {...mergeClassProp(props, "flex gap-4")} />
}

export function Column(props: ComponentProps<"div">) {
	return <div {...mergeClassProp(props, "flex flex-col gap-4")} />
}
