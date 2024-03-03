import type { MetaFunction } from "@remix-run/node"
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react"
import "tailwindcss/tailwind.css"

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
		<html lang="en" className="bg-gray-950 text-gray-50">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

export default function App() {
	return <Outlet />
}
