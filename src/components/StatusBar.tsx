import { twMerge } from "tailwind-merge"

interface StatusBarProps {
	value: number
	max: number
	className?: string
}

export function StatusBar({ value, max, className }: StatusBarProps) {
	const fillScale = Math.max(0, Math.min(1, value / max))

	return (
		<div
			className={twMerge(
				"relative h-5 overflow-clip rounded-sm border-2 border-current shadow-sm",
				className,
			)}
		>
			{/* minus 1px inset ensures it actually fills the rectangle without a pixel gap from subpixel rendering */}
			<div
				className="absolute -inset-px origin-left bg-current opacity-75"
				style={{
					scale: `${fillScale} 1`,
				}}
			/>
		</div>
	)
}
