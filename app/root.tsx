import "@fontsource-variable/nunito"
import "./root.css"

import { ClerkApp, useAuth, useUser } from "@clerk/remix"
import { rootAuthLoader } from "@clerk/remix/ssr.server"
import { dark } from "@clerk/themes"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react"
import { ConvexReactClient, useConvexAuth, useMutation, useQuery } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { isEqual } from "lodash-es"
import { useEffect } from "react"
import { api } from "#convex/_generated/api.js"
import { clientEnv } from "./env.ts"
import { theme } from "./theme.ts"
import { Loading } from "./ui/Loading.tsx"

const convex = new ConvexReactClient(clientEnv.VITE_CONVEX_URL)

export const loader = (args: LoaderFunctionArgs) => rootAuthLoader(args)

export const meta: MetaFunction = () => [
	{ title: "Aspects VTT" },
	{ name: "description", content: "A virtual tabletop for the Aspects of Nature tabletop RPG" },
]

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
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

function App() {
	return (
		<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
			<ConvexAuthGuard>
				<Outlet />
			</ConvexAuthGuard>
		</ConvexProviderWithClerk>
	)
}

export default ClerkApp(App, {
	telemetry: false,
	appearance: {
		baseTheme: dark,
		variables: {
			borderRadius: "0.25rem",
			colorBackground: theme.colors.primary[200],
			colorText: theme.colors.primary[900],
			colorPrimary: theme.colors.primary[600],
			colorInputBackground: theme.colors.primary[300],
			colorInputText: theme.colors.primary[900],
		},
	},
})

function ConvexAuthGuard({ children }: { children: React.ReactNode }) {
	const { isLoading, isAuthenticated } = useConvexAuth()
	const { user } = useUser()
	const currentUser = useQuery(api.auth.user)
	const updateUser = useMutation(api.auth.setup)

	useEffect(() => {
		const isReady = user && isAuthenticated && currentUser !== undefined
		if (!isReady) return

		const newUser = {
			name: user.username || user.firstName || user.id,
			avatarUrl: user.imageUrl,
		}
		if (isEqual(currentUser, newUser)) {
			console.log("User properties are the same, update skipped")
			return
		}

		updateUser(newUser)
	}, [user, isAuthenticated, updateUser, currentUser])

	return isLoading ? <Loading fill="screen" /> : children
}
