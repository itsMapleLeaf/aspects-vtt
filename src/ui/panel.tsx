import { twMerge } from "tailwind-merge"
import { Slot, SlotProps } from "./slot.tsx"

export function Panel(props: SlotProps) {
	return (
		<Slot
			{...props}
			className={twMerge(
				"border-base-700 bg-base-900 block rounded-lg border shadow",
				props.className,
			)}
		/>
	)
}
