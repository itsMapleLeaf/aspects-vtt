import { type ComponentPropsWithoutRef, type ReactElement, cloneElement, useState } from "react"
import { useFormStatus } from "react-dom"
import { twMerge } from "tailwind-merge"
import type { Overwrite } from "~/common/types.ts"
import { Loading } from "./Loading.tsx"
import { withMergedClassName } from "./withMergedClassName"

export type ButtonProps = {
	icon: ReactElement | undefined
	text?: string
	size?: "md" | "lg"
} & (
	| {
			element: ReactElement
			className?: string
	  }
	| Overwrite<
			ComponentPropsWithoutRef<"button">,
			{
				onClick?: (event: React.MouseEvent<HTMLButtonElement>) => unknown
			}
	  >
)

export function Button({ text, icon, size = "md", ...props }: ButtonProps) {
	const [onClickPending, setOnClickPending] = useState(false)
	const status = useFormStatus()
	const pending = status.pending || onClickPending

	const className = twMerge(
		"flex items-center gap-2",

		size === "md" && "h-10 px-3",
		size === "lg" && "h-12 px-4",

		"rounded border border-primary-300",
		"ring-primary-400 focus:outline-none focus-visible:ring-2",

		"relative before:absolute before:inset-0 before:size-full",

		"transition active:duration-0",
		"before:transition active:before:duration-0",

		"bg-primary-300/30",
		"before:bg-primary-300/60 hover:text-primary-700 active:before:bg-primary-300",

		"translate-y-0 active:translate-y-0.5",
		"before:origin-bottom before:scale-y-0 hover:before:scale-y-100",
	)

	const children = (
		<>
			<span
				data-size={size}
				className="relative -mx-1 *:size-5 empty:hidden *:data-[size=lg]:size-8"
			>
				{pending ?
					<Loading size="sm" />
				:	icon}
			</span>
			<span data-size={size} className="relative flex-1 empty:hidden">
				{text}
			</span>
		</>
	)

	return "element" in props ?
			cloneElement(props.element, {
				className: twMerge(className, props.className),
				children: children,
			})
		:	<button
				type="button"
				disabled={pending}
				{...withMergedClassName(props, className)}
				onClick={async (event) => {
					setOnClickPending(true)
					try {
						await props.onClick?.(event)
					} catch {}
					setOnClickPending(false)
				}}
			>
				{children}
			</button>
}
