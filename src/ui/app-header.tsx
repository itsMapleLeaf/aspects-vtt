import { Link } from "@remix-run/react"
import { UserButton } from "../auth/user-button.tsx"
import { AppLogo } from "./app-logo.tsx"

export function AppHeader() {
	return (
		<div className="navbar p-3">
			<div className="navbar-start">
				<Link to="/" className="btn btn-ghost">
					<h1 className="text-2xl">
						<AppLogo />
					</h1>
				</Link>
			</div>
			<div className="navbar-end">
				<UserButton />
			</div>
		</div>
	)
}
