import { mergeClassProp } from "./helpers.ts"
import { Slot, SlotProps } from "./slot.tsx"

export function GridList(props: SlotProps) {
	return (
		<Slot
			{...mergeClassProp(
				props,
				"grid grid-cols-[repeat(auto-fill,minmax(theme(spacing.48),1fr))] gap-3",
			)}
		/>
	)
}
