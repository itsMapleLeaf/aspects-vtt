import { NavLink } from "@remix-run/react"
import { ComponentProps } from "react"
import { Button } from "./button.tsx"

export function ButtonNavLink({
	to,
	...props
}: ComponentProps<typeof Button> & {
	to: string
}) {
	return (
		<NavLink to={to} prefetch="intent">
			{(state) => (
				<Button
					pending={state.isPending || state.isTransitioning}
					{...props}
					element={<div />}
				/>
			)}
		</NavLink>
	)
}
