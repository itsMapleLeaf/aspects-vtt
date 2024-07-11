import { twMerge } from "tailwind-merge"
import { mergeClassProp } from "./helpers.ts"
import { Loading } from "./loading.tsx"

export interface ButtonProps extends React.ComponentProps<"button"> {
	icon?: React.ReactNode
	appearance?: keyof typeof styles.appearance
	pending?: boolean
}

export function Button({
	icon: iconProp,
	appearance = "solid",
	pending,
	children,
	...props
}: ButtonProps) {
	const icon = pending ? <Loading /> : iconProp

	return (
		<button
			type="button"
			disabled={pending}
			{...mergeClassProp(
				props,
				"border border-transparent",
				"rounded",
				"text-base/none font-medium",
				"transition active:duration-0",
				"will-change-transform active:[&:not(:disabled)]:scale-95",
				"disabled:opacity-75 disabled:cursor-not-allowed",
				"flex items-center gap-3 justify-center",
				icon && !children ? "size-10" : "h-10 px-3",
				styles.appearance[appearance],
			)}
		>
			{icon && <div className="flex-shrink-0 *:size-5">{icon}</div>}
			{children}
		</button>
	)
}

const styles = {
	appearance: {
		solid: twMerge(`
			bg-stone-900 hover:[&:not(:disabled)]:bg-stone-800 active:[&:not(:disabled)]:bg-stone-700
			border-stone-700 hover:[&:not(:disabled)]:border-stone-600
		`),
		clear: twMerge(`
			bg-transparent hover:[&:not(:disabled)]:bg-stone-800 active:[&:not(:disabled)]:bg-stone-700
			hover:[&:not(:disabled)]:border-stone-800 active:[&:not(:disabled)]:border-stone-700
		`),
	},
}
