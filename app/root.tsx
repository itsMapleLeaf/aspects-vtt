import "@fontsource-variable/manrope"
import "./root.css"

import type { LoaderFunctionArgs } from "@remix-run/node"
import type { MetaFunction } from "@remix-run/node"
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
	useRouteError,
} from "@remix-run/react"
import type { ErrorBoundaryComponent } from "@remix-run/react/dist/routeModules"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import { clientEnv } from "./env.ts"
import { SessionError } from "./features/user/session.tsx"
import { UserProvider } from "./features/user/useUser.tsx"
import { getPreferences } from "./preferences.server.ts"

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

export async function loader({ request }: LoaderFunctionArgs) {
	const preferences = await getPreferences(request)
	return { user: preferences.username ? { username: preferences.username } : undefined }
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="text-balance break-words bg-primary-100 text-primary-900">
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
	const data = useLoaderData<typeof loader>()
	return (
		<UserProvider user={data.user}>
			<Outlet />
		</UserProvider>
	)
}

export const ErrorBoundary: ErrorBoundaryComponent = () => {
	const error = useRouteError()

	if (error instanceof SessionError) {
		return <p>{error.message}</p>
	}
}
