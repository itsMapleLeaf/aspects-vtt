import { Virtuoso } from "react-virtuoso"
import { input } from "./styles.ts"

export function SearchableList<T extends object>({
	search,
	onSearchChange,
	items,
	renderItem,
	actions,
}: {
	search: string
	onSearchChange: (search: string) => void
	items: readonly T[]
	renderItem: (item: T) => React.ReactNode
	actions?: React.ReactNode
}) {
	return (
		<div className="flex h-full flex-col gap">
			<div className="flex gap-2">
				<input
					className={input()}
					placeholder="Search"
					value={search}
					onChange={(event) => onSearchChange(event.target.value)}
				/>
				{actions}
			</div>
			<div className="-my-1.5 flex-1">
				<Virtuoso
					className="h-full"
					data={items}
					itemContent={(_index, item) => (
						<div className="py-1.5">{renderItem(item)}</div>
					)}
					computeItemKey={(index, item) =>
						"_id" in item && typeof item._id === "string" ? item._id : index
					}
				/>
			</div>
		</div>
	)
}
