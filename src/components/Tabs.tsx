import * as Ariakit from "@ariakit/react"
import { twMerge } from "tailwind-merge"

export * as Tabs from "./Tabs.tsx"

export function Root(props: Ariakit.TabProviderProps) {
	return <Ariakit.TabProvider {...props} />
}

export function Tab(props: Ariakit.TabProps) {
	return (
		<Ariakit.Tab
			{...props}
			className={twMerge(
				"rounded-md px-2 opacity-50 transition hover:bg-primary-700 hover:opacity-75 data-[active-item]:bg-primary-700 data-[active-item]:opacity-100",
				props.className,
			)}
		/>
	)
}

export function List(props: Ariakit.TabListProps) {
	return (
		<Ariakit.TabList
			{...props}
			className={twMerge(
				"grid h-10 auto-cols-fr grid-flow-col gap-2",
				props.className,
			)}
		/>
	)
}

export function Panel(props: Ariakit.TabPanelProps) {
	return <Ariakit.TabPanel {...props} />
}
