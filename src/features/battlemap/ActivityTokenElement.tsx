import { ComponentProps } from "react"
import { BaseTokenElement } from "./BaseTokenElement.tsx"

export function ActivityTokenElement({
	selected,
	...props
}: { selected: boolean } & ComponentProps<typeof BaseTokenElement>) {
	return (
		<BaseTokenElement {...props}>
			<div
				className="@container absolute inset-0 size-full transition-opacity data-[visible=false]:opacity-50"
				data-visible={props.token.visible}
			>
				<div className="animate-in zoom-in-110 direction-alternate repeat-infinite absolute inset-[15%] rounded-full bg-white/50 duration-500 ease-in" />
				<div className="absolute inset-[20%] rounded-full bg-white/75" />
				<div className="absolute inset-0 grid place-items-center text-[50cqw] font-bold text-gray-900">
					!
				</div>
				{selected && (
					<div className="border-accent-900 bg-accent-600/50 pointer-events-none absolute inset-[20%] rounded-full border-2 transition-opacity" />
				)}
			</div>
		</BaseTokenElement>
	)
}
