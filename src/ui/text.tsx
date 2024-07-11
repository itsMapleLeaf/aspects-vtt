import { ComponentProps } from "react"
import { mergeClassProp } from "./helpers.ts"

export function Heading(props: ComponentProps<"h1">) {
	return <h1 {...mergeClassProp(props, "text-3xl font-light")} />
}
