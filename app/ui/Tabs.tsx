import * as Ariakit from "@ariakit/react"
import { twMerge } from "tailwind-merge"

export function Tabs(props: Ariakit.TabProviderProps) {
	return <Ariakit.TabProvider {...props} />
}

function List(props: Ariakit.TabListProps) {
	return (
		<Ariakit.TabList
			{...props}
			className={twMerge("flex flex-wrap p-1.5 gap-1.5", props.className)}
		/>
	)
}
Tabs.List = List

function Tab(props: Ariakit.TabProps) {
	return (
		<Ariakit.Tab
			{...props}
			className={twMerge(
				"h-10 px-3 rounded opacity-50 aria-selected:opacity-100 aria-selected:bg-primary-200 transition hover:bg-primary-200 flex-1",
				props.className,
			)}
		/>
	)
}
Tabs.Tab = Tab

function Panel(props: Ariakit.TabPanelProps) {
	return (
		<Ariakit.TabPanel
			{...props}
			className={twMerge(
				"translate-y-2 opacity-0 transition duration-0 data-[enter]:duration-150 data-[enter]:translate-y-0 data-[enter]:opacity-100",
				props.className,
			)}
		/>
	)
}
Tabs.Panel = Panel
