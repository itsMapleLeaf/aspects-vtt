import { Link, useNavigate } from "@remix-run/react"
import { UserButton } from "../components/UserButton.tsx"
import { AppLogo } from "./app-logo.tsx"
import { clearButton } from "./styles.ts"

export function AppHeader() {
	const navigate = useNavigate()
	return (
		<div className="flex items-center p-3">
			<div className="flex flex-1">
				<Link
					to="/"
					className={clearButton()}
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
			<div className="flex flex-1 justify-end">
				<UserButton />
			</div>
		</div>
	)
}
