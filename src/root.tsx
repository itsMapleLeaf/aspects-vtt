import "@fontsource-variable/nunito"
import "./root.css"

import { ConvexAuthProvider } from "@convex-dev/auth/react"
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react"
import { ConvexReactClient } from "convex/react"
import React from "react"

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="bg-base-950 text-base-50">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<link rel="icon" type="image/svg+xml" href="/convex.svg" />
				<Meta />
				<Links />
				<title>Aspects VTT</title>
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
	const [convex] = React.useState(
		() => new ConvexReactClient(import.meta.env.VITE_CONVEX_URL),
	)
	return (
		<ConvexAuthProvider client={convex}>
			<Outlet />
		</ConvexAuthProvider>
	)
}