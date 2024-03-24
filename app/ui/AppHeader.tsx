import { Link } from "@remix-run/react"
import { $path } from "remix-routes"

export function AppHeader({ children }: { children?: React.ReactNode }) {
	return (
		<header className="flex items-center gap-3">
			<Link to={$path("/")}>
				<h1 className="text-2xl">
					<span className="font-light text-primary-600">Aspects</span>
					<span className="font-medium text-primary-800">VTT</span>
				</h1>
			</Link>
			<div className="flex flex-1 justify-end gap-2">{children}</div>
		</header>
	)
}
