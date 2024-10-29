import { ComponentProps } from "react"
import { BaseTokenElement } from "./BaseTokenElement.tsx"

export function ActivityTokenElement({
	selected,
	...props
}: { selected: boolean } & ComponentProps<typeof BaseTokenElement>) {
	return (
		<BaseTokenElement {...props}>
			<div className="absolute inset-0 size-full @container">
				<div className="absolute inset-[15%] rounded-full bg-white/50 duration-500 ease-in animate-in zoom-in-110 direction-alternate repeat-infinite" />
				<div className="absolute inset-[20%] rounded-full bg-white/75" />
				<div className="absolute inset-0 grid place-items-center text-[50cqw] font-bold text-gray-900">
					!
				</div>
				{selected && (
					<div className="pointer-events-none absolute inset-[20%] rounded-full border-2 border-accent-900 bg-accent-600/50 transition-opacity" />
				)}
			</div>
		</BaseTokenElement>
	)
}
