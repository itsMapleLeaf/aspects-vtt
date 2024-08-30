import { matchSorter } from "match-sorter"
import { useState } from "react"
import { Virtuoso } from "react-virtuoso"
import { input } from "./styles.ts"

export function SearchableList<T extends { _id?: string }>({
	items,
	renderItem,
	searchKeys,
	actions,
}: {
	items: T[]
	renderItem: (item: T) => React.ReactNode
	searchKeys: SearchableKeys<T>[]
	actions?: React.ReactNode
}) {
	const [search, setSearch] = useState("")

	const sortedItems = matchSorter(items, search, {
		keys: searchKeys,
	})

	return (
		<div className="flex h-full flex-col gap">
			<div className="flex gap-2">
				<input
					className={input()}
					placeholder="Search"
					value={search}
					onChange={(event) => setSearch(event.target.value)}
				/>
				{actions}
			</div>
			<div className="-my-1.5 flex-1">
				<Virtuoso
					className="h-full"
					data={sortedItems}
					itemContent={(index, item) => (
						<div className="py-1.5">{renderItem(item)}</div>
					)}
					computeItemKey={(index, item) => item._id ?? index}
				/>
			</div>
		</div>
	)
}

type SearchableKeys<T, K extends keyof T = keyof T> = K extends string
	? T[K] extends string
		? K
		: string extends T[K]
			? K
			: never
	: never
