import { Slottable, type SlottableProps } from "./Slottable.tsx"
import { withMergedClassName } from "./withMergedClassName.ts"

export function Panel(props: SlottableProps) {
	return (
		<Slottable
			{...withMergedClassName(props, "rounded border border-primary-300 bg-primary-200")}
			fallback={<div />}
		/>
	)
}

export function TranslucentPanel(props: SlottableProps) {
	return <Panel {...withMergedClassName(props, "bg-primary-100/75 shadow-md backdrop-blur")} />
}
