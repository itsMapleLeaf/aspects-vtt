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
				"flex h-10 flex-1 items-center justify-center rounded-md px-4 opacity-50 transition gap-3 hover:bg-primary-700 hover:opacity-75 data-[active-item]:bg-primary-700 data-[active-item]:opacity-100 [&>svg]:-mx-1 [&>svg]:size-5",
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
				"flex flex-wrap items-center justify-center gap-2",
				props.className,
			)}
		/>
	)
}

export function Panel(props: Ariakit.TabPanelProps) {
	return <Ariakit.TabPanel {...props} />
}
