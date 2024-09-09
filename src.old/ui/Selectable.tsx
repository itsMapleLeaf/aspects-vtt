import { twMerge } from "tailwind-merge"
import { Pressable, PressableProps } from "./Pressable.tsx"

export function Selectable({
	children,
	active,
	...props
}: PressableProps & {
	active: boolean
	onPress?: (event: React.PointerEvent) => void
}) {
	return (
		<Pressable
			{...props}
			data-selectable-active={active || undefined}
			className={twMerge("relative block w-full", props.className)}
		>
			{children}
			<div
				className="pointer-events-none absolute inset-0 grid scale-95 place-content-center rounded-lg border-2 border-accent-500 bg-accent-800/60 text-accent-600 opacity-0 transition data-[active]:scale-100 data-[active]:opacity-100"
				data-active={active || undefined}
			></div>
		</Pressable>
	)
}
