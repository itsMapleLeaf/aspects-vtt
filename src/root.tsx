import "./konva"

import { ConvexAuthProvider } from "@convex-dev/auth/react"
import nunito from "@fontsource-variable/nunito?url"
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useNavigate,
} from "@remix-run/react"
import type { LinksFunction } from "@remix-run/server-runtime"
import { ConvexReactClient } from "convex/react"
import { ConvexError } from "convex/values"
import { useEffect } from "react"
import { toast } from "react-toastify"
import toastify from "react-toastify/ReactToastify.css?url"
import { CustomToastContainer } from "./components/CustomToastContainer.tsx"
import styles from "./root.css?url"

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: nunito },
	{ rel: "stylesheet", href: toastify },
	{ rel: "stylesheet", href: styles },
]

export function Layout({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		const controller = new AbortController()

		window.addEventListener(
			"unhandledrejection",
			(error) => {
				if (
					error.reason instanceof ConvexError &&
					typeof error.reason.data === "string"
				) {
					toast.error(error.reason.data)
				} else {
					toast.error("Something went wrong. Check the console for details.")
				}
				console.error(error.reason)
			},
			{ signal: controller.signal },
		)

		return () => controller.abort()
	})

	return (
		<html
			lang="en"
			className="dark text-pretty break-words bg-primary-900 text-primary-100"
		>
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<link rel="icon" href="/favicon.svg" />
				<Meta />
				<Links />
				<title>Aspects VTT</title>
			</head>
			<body>
				{children}
				<Scripts />
				<ScrollRestoration />
				<CustomToastContainer />
			</body>
		</html>
	)
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL, {
	verbose: true,
	reportDebugInfoToConvex: true,
})

export default function Root() {
	const navigate = useNavigate()
	return (
		<ConvexAuthProvider
			client={convex}
			replaceURL={(url) => {
				navigate(url)
			}}
		>
			<Outlet />
		</ConvexAuthProvider>
	)
}
