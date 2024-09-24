import { LucidePackageOpen } from "lucide-react"
import React, { startTransition, useState, type ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { textInput } from "~/styles/input.ts"
import { secondaryHeading } from "~/styles/text.ts"

export interface SearchListLayoutProps<T> {
	items: T[]
	renderItem: (item: T) => React.ReactNode
	onSearch: (search: string) => void
	actions?: ReactNode
	emptyStateIcon?: React.ReactNode
	emptyStateText?: string
	className?: string
}

export function SearchListLayout<T>({
	items,
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

	return (
		<div className={twMerge("flex h-full flex-col p-gap gap-2", className)}>
			<div className="flex gap-2">
				<input
					className={textInput("flex-1")}
					placeholder="Search..."
					value={search}
					onChange={handleSearch}
				/>
				{actions}
			</div>
			{items.length > 0 ? (
				<ul className="flex min-h-0 flex-1 flex-col overflow-y-auto gap-2">
					{items.map(renderItem)}
				</ul>
			) : (
				<div className="flex flex-1 flex-col items-center justify-center gap-2">
					<div className="text-primary-500 *:size-16 *:stroke-1">
						{emptyStateIcon}
					</div>
					<p className={secondaryHeading("opacity-60")}>{emptyStateText}</p>
				</div>
			)}
		</div>
	)
}