import { Link, useNavigate } from "@remix-run/react"
import { twMerge } from "tailwind-merge"
import { UserButton } from "../features/auth/UserButton.tsx"
import { AppLogo } from "./app-logo.tsx"
import { clearButton } from "./styles.ts"

export function AppHeader({
	left,
	right,
	className,
}: {
	left?: React.ReactNode
	right?: React.ReactNode
	className?: string
}) {
	const navigate = useNavigate()
	return (
		<div className={twMerge("flex items-center p-3", className)}>
			<div className="flex flex-1 items-center gap-3">
				{left}
				<Link
					to="/"
					className={clearButton("-mx-2 px-2")}
					onContextMenu={(event) => {
						event.preventDefault()
						navigate("/ds")
					}}
				>
					<h1 className="text-2xl">
						<AppLogo />
					</h1>
				</Link>
			</div>
			<div className="flex flex-1 justify-end gap-3">
				<UserButton />
				{right}
			</div>
		</div>
	)
}
