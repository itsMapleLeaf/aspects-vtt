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
import { useState } from "react"

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="en"
			className="dark text-pretty break-words bg-primary-900 text-primary-100"
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
	const [client] = useState(
		() => new ConvexReactClient(import.meta.env.VITE_CONVEX_URL),
	)
	return (
		<ConvexAuthProvider client={client}>
			<Outlet />
		</ConvexAuthProvider>
	)
}
