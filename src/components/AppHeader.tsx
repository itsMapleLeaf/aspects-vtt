import { Link } from "@remix-run/react"
import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import { UserButton } from "~/features/auth/UserButton.tsx"
import { Heading } from "~/lib/react/heading"
import { heading } from "~/ui/styles.ts"
import { Button } from "./Button.tsx"

export function AppHeader(props: ComponentProps<"header">) {
	return (
		<header
			{...props}
			className={twMerge(
				"flex items-center justify-between p-2",
				props.className,
			)}
		>
			<Button asChild appearance="clear" size="large" className="h-14">
				<Link to="/">
					<Heading className={heading()}>
						<span>Aspects</span>
						<span>VTT</span>
					</Heading>
				</Link>
			</Button>
			<UserButton />
		</header>
	)
}
