import "@fontsource-variable/nunito"
import "./root.css"

import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react"

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="en"
			className="dark text-pretty break-words bg-background text-foreground"
		>
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<Scripts />
				<ScrollRestoration />
			</body>
		</html>
	)
}

export default function Root() {
	return <Outlet />
}
