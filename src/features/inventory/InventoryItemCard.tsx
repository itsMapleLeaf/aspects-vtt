import type { ComponentProps } from "react"
import { Heading } from "~/components/Heading.tsx"
import { interactivePanel } from "~/styles/panel.ts"
import { secondaryHeading, subText } from "~/styles/text.ts"
import type { ApiItem } from "./items.ts"

export function InventoryItemCard({
	item,
	...props
}: { item: ApiItem } & ComponentProps<"button">) {
	return (
		<button
			type="button"
			{...props}
			className={interactivePanel(
				"flex w-full cursor-default flex-col p-2 text-left gap-1.5",
				props.className,
			)}
		>
			<Heading className={secondaryHeading()}>{item.name}</Heading>
			<p className="-mb-0.5 -mt-1 leading-snug empty:hidden">{item.effect}</p>
			<aside className={subText("italic empty:hidden")}>{item.flavor}</aside>
		</button>
	)
}
