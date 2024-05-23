import * as Ariakit from "@ariakit/react"
import { twMerge } from "tailwind-merge"

export function Tabs(props: Ariakit.TabProviderProps) {
	return <Ariakit.TabProvider {...props} />
}

function List(props: Ariakit.TabListProps) {
	return (
		<Ariakit.TabList {...props} className={twMerge("flex flex-wrap gap-1.5", props.className)} />
	)
}
Tabs.List = List

function Tab(props: Ariakit.TabProps) {
	return (
		<Ariakit.Tab
			{...props}
			className={twMerge(
				"h-10 flex-1 rounded px-3 opacity-50 transition hover:bg-primary-200 aria-selected:bg-primary-200 aria-selected:opacity-100",
				props.className,
			)}
		/>
	)
}
Tabs.Tab = Tab

function Panel(props: Ariakit.TabPanelProps) {
	return <Ariakit.TabPanel {...props} />
}
Tabs.Panel = Panel
