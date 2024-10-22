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
import toastify from "react-toastify/ReactToastify.css?url"
import { CustomToastContainer } from "./components/CustomToastContainer.tsx"
import styles from "./root.css?url"

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: nunito },
	{ rel: "stylesheet", href: toastify },
	{ rel: "stylesheet", href: styles },
]

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
