import { dark } from "@clerk/themes"
import "@fontsource-variable/manrope"
import "./root.css"

import { ClerkApp, UserButton, useAuth, useUser } from "@clerk/remix"
import { rootAuthLoader } from "@clerk/remix/ssr.server"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { Link, Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react"
import { ConvexReactClient, useConvexAuth, useMutation } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { useEffect } from "react"
import { createPortal } from "react-dom"
import { $path } from "remix-routes"
import { api } from "#convex/_generated/api.js"
import { expect } from "./common/expect.ts"
import { useIsomorphicValue } from "./common/react.ts"
import { clientEnv } from "./env.ts"
import { theme } from "./theme.ts"
import { Loading } from "./ui/Loading.tsx"

const convex = new ConvexReactClient(clientEnv.VITE_CONVEX_URL)

export const loader = (args: LoaderFunctionArgs) => rootAuthLoader(args)

export const meta: MetaFunction = () => [
	{ title: "Aspects VTT" },
	{ name: "description", content: "A virtual tabletop for the Aspects of Nature tabletop RPG" },
]

const headerRightId = "header-right"

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
				<div className="p-4">
					<header className="mb-4 flex items-center gap-3">
						<Link to={$path("/")}>
							<h1 className="text-2xl">
								<span className="font-light text-primary-600">Aspects</span>
								<span className="font-medium text-primary-800">VTT</span>
							</h1>
						</Link>
						<div className="flex flex-1 justify-end gap-2" id={headerRightId} />
					</header>
					<div className="h-[calc(100dvh-theme(spacing.20))]">{children}</div>
				</div>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

function App() {
	const headerRightElement = useIsomorphicValue({
		client: () => {
			return expect(document.getElementById(headerRightId), "#header-right element missing")
		},
	})
	return (
		<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
			<ConvexAuthGuard>
				<Outlet />
				{/* this may be my most cursed usage of react ever */}
				{headerRightElement && createPortal(<UserButton />, headerRightElement)}
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
	const { user } = useUser()
	const setup = useMutation(api.auth.setup)
	const { isLoading, isAuthenticated } = useConvexAuth()
	useEffect(() => {
		if (user?.username && isAuthenticated) {
			setup({ name: user.username, avatarUrl: user.imageUrl })
		}
	}, [user?.username, user?.imageUrl, isAuthenticated, setup])
	return isLoading ? <Loading fill="screen" /> : children
}
