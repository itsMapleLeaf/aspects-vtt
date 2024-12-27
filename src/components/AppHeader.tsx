import type { ComponentProps, ReactNode } from "react"
import { Link } from "react-router"
import { twMerge } from "tailwind-merge"
import { UserButton } from "~/features/auth/UserButton.tsx"
import { heading } from "~/ui/styles.ts"
import { Button } from "./Button.tsx"
import { Heading, HeadingLevel } from "./Heading.tsx"

interface AppHeaderProps extends ComponentProps<"header"> {
	start?: ReactNode
	end?: ReactNode
}

export function AppHeader({ start, end, ...props }: AppHeaderProps) {
	return (
		<header
			{...props}
			className={twMerge(
				"flex items-center justify-between p-2",
				props.className,
			)}
		>
			{start}
			<Button asChild appearance="clear" size="large" className="h-14">
				<Link to="/">
					<HeadingLevel>
						<Heading className={heading()}>
							<span>Aspects</span>
							<span>VTT</span>
						</Heading>
					</HeadingLevel>
				</Link>
			</Button>
			<UserButton />
			{end}
		</header>
	)
}
