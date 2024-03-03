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
		<html lang="en" className="bg-primary-100 text-primary-900">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<p className="bg-primary-100">test</p>
				<p className="bg-primary-200">test</p>
				<p className="bg-primary-300">test</p>
				<p className="bg-primary-400">test</p>
				<p className="bg-primary-500">test</p>
				<p className="bg-primary-600">test</p>
				<p className="bg-primary-700">test</p>
				<p className="bg-primary-800">test</p>
				<p className="bg-primary-900">test</p>
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
