import { ComponentProps } from "react"
import { ListCard } from "../../components/ListCard.tsx"
import type { ApiItem } from "./items.ts"

export function InventoryItemCard({
	item,
	...props
}: { item: ApiItem } & ComponentProps<"button">) {
	return (
		<ListCard
			title={item.name}
			description={item.effect}
			aside={item.flavor}
			{...props}
		/>
	)
}
