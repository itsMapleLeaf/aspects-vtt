import { mergeClassProp } from "./helpers.ts"
import { Slot, SlotProps } from "./slot.tsx"

export function Container(props: SlotProps) {
	return <Slot {...mergeClassProp(props, "mx-auto w-full max-w-screen-sm")} />
}
