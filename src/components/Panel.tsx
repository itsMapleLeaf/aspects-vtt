import {
	AsChildComponent,
	type AsChildComponentProps,
} from "./AsChildComponent.tsx"

export function Panel(props: AsChildComponentProps) {
	return (
		<AsChildComponent
			fallbackTag="div"
			baseClass="rounded border border-primary-700 bg-primary-800"
			{...props}
		/>
	)
}
