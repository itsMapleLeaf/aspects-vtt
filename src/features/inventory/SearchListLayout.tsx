import { useAutoAnimate } from "@formkit/auto-animate/react"
import { LucidePackageOpen } from "lucide-react"
import React, {
	startTransition,
	useState,
	type Key,
	type ReactNode,
} from "react"
import { twMerge } from "tailwind-merge"
import { ConditionalKeys } from "type-fest"
import type { List } from "~/shared/list.ts"
import { textInput } from "~/styles/input.ts"
import { secondaryHeading } from "~/styles/text.ts"

export interface SearchListLayoutProps<T> {
	items: T[] | List<T>
	itemKey: ConditionalKeys<T, Key> | ((item: T) => Key)
	renderItem: (item: T) => React.ReactNode
	onSearch: (search: string) => void
	actions?: ReactNode
	emptyStateIcon?: React.ReactNode
	emptyStateText?: string
	className?: string
}

export function SearchListLayout<T>({
	items,
	itemKey,
	renderItem,
	onSearch,
	actions,
	emptyStateIcon = <LucidePackageOpen />,
	emptyStateText = "Nothing here!",
	className,
}: SearchListLayoutProps<T>) {
	const [search, setSearch] = useState("")

	const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newSearch = event.currentTarget.value
		setSearch(newSearch)
		startTransition(() => {
			onSearch(newSearch)
		})
	}

	const [animateRef] = useAutoAnimate()

	function getItemKey(item: T): React.Key {
		if (typeof itemKey === "function") {
			return itemKey(item)
		}
		const keyValue = item[itemKey]
		if (typeof keyValue === "string" || typeof keyValue === "number") {
			return keyValue
		}
		throw new Error(`unexpected: item key is not valid: ${keyValue}`)
	}

	return (
		<div className={twMerge("flex h-full flex-col p-[--gap] gap-2", className)}>
			<div className="flex gap">
				<input
					className={textInput("flex-1")}
					placeholder="Search..."
					value={search}
					onChange={handleSearch}
				/>
				{actions}
			</div>
			{items.length > 0 ? (
				<ul
					className="-m-[--gap] mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto p-gap pt-0 gap"
					ref={animateRef}
				>
					{items.map((item) => (
						<li key={getItemKey(item)} className="contents">
							{renderItem(item)}
						</li>
					))}
				</ul>
			) : (
				<div className="flex flex-1 flex-col items-center justify-center gap">
					<div className="text-primary-500 *:size-16 *:stroke-1">
						{emptyStateIcon}
					</div>
					<p className={secondaryHeading("opacity-60")}>{emptyStateText}</p>
				</div>
			)}
		</div>
	)
}
