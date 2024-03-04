import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { twMerge } from "tailwind-merge"

export type ButtonProps = Omit<
	ComponentPropsWithoutRef<"button">,
	"children"
> & {
	text: string
	icon: ReactNode
}

export function Button({ text, icon, ...props }: ButtonProps) {
	return (
		<button
			type="button"
			{...props}
			className={twMerge(
				"h-10 flex items-center gap-2 px-3 border border-primary-300 rounded bg-primary-300/30 relative before:absolute before:size-full before:inset-0 before:bg-primary-300/60 before:origin-bottom before:scale-y-0 before:transition hover:before:scale-y-100 transition active:before:bg-primary-300 hover:text-primary-700 translate-y-0 active:translate-y-0.5 active:duration-0 active:before:duration-0",
				props.className,
			)}
		>
			<span className="relative *:size-5 empty:hidden">{icon}</span>
			<span className="relative flex-1">{text}</span>
		</button>
	)
}
