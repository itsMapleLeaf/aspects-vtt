import { twMerge } from "tailwind-merge"
import { clamp } from "../../common/math.ts"

export function TokenMeter({
	value,
	className,
}: {
	value: number
	className: { base: string; warning: string; danger: string }
}) {
	return (
		<div
			aria-hidden
			className={twMerge(
				"relative h-3 w-24 rounded border border-current shadow transition-all",
				value < 0.5 ? className.base
				: value < 0.8 ? className.warning
				: className.danger,
			)}
		>
			<div
				className="absolute inset-0 origin-left bg-current transition-[scale]"
				style={{ scale: `${clamp(value, 0, 1)} 1` }}
			/>
			<div className="absolute inset-0 bg-current opacity-25" />
		</div>
	)
}
