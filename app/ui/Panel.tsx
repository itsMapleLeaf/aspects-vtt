import { Slottable, type SlottableProps } from "./Slottable.tsx"
import { withMergedClassName } from "./withMergedClassName.ts"

export function Panel(props: SlottableProps) {
	return (
		<Slottable
			{...withMergedClassName(
				props,
				"rounded border border-primary-700 bg-primary-800",
			)}
			fallback={<div />}
		/>
	)
}

export function TranslucentPanel(props: SlottableProps) {
	return (
		<Panel
			{...withMergedClassName(
				props,
				"bg-primary-900/75 shadow-md backdrop-blur",
			)}
		/>
	)
}
