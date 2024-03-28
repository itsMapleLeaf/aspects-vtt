import * as Ariakit from "@ariakit/react"
import { panel } from "#app/ui/styles.js"
import { withMergedClassName } from "#app/ui/withMergedClassName.js"

export function Popover(props: Ariakit.PopoverProviderProps) {
	return <Ariakit.PopoverProvider {...props} />
}
export function PopoverTrigger(props: Ariakit.PopoverDisclosureProps) {
	return <Ariakit.PopoverDisclosure {...props} />
}
export function PopoverPanel(props: Ariakit.PopoverProps) {
	return (
		<Ariakit.Popover
			portal
			gutter={8}
			{...withMergedClassName(props, panel("bg-primary-100 shadow-md shadow-black/50"))}
		/>
	)
}
