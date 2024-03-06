import "@fontsource-variable/maven-pro"
import type { MetaFunction } from "@remix-run/node"
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import "tailwindcss/tailwind.css"
import { clientEnv } from "./env.ts"

const convex = new ConvexReactClient(clientEnv.VITE_CONVEX_URL)

export const meta: MetaFunction = () => {
	return [
		{ title: "Aspects VTT" },
		{
			name: "description",
			content: "A virtual tabletop for the Aspects of Nature tabletop RPG",
		},
	]
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="bg-primary-100 text-primary-900 break-words">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<ConvexProvider client={convex}>{children}</ConvexProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

export default function App() {
	return <Outlet />
}
