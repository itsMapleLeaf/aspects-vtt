import { Link } from "@remix-run/react"
import type { MDXComponents } from "mdx/types"
import { twMerge } from "tailwind-merge"

export function useMDXComponents(): MDXComponents {
	return {
		a: ({ href, ...props }) => (
			<Link
				{...props}
				to={href}
				className={twMerge(
					"text-primary-100 underline hover:no-underline",
					props.className,
				)}
			/>
		),
	}
}
