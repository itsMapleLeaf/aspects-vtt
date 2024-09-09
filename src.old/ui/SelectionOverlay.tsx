import { twMerge } from "tailwind-merge"

interface SelectionOverlayProps {
	visible?: boolean
	className?: string
}

export function SelectionOverlay({
	visible,
	className,
}: SelectionOverlayProps) {
	return (
		<div
			data-visible={visible || undefined}
			className={twMerge(
				"invisible absolute inset-0 scale-95 rounded-[inherit] border-2 border-accent-500 bg-accent-800/50 opacity-0 transition-all data-[visible]:visible data-[visible]:scale-100 data-[visible]:opacity-100",
				className,
			)}
		/>
	)
}
