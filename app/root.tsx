import { installIntoGlobal } from "iterator-helpers-polyfill"
installIntoGlobal()

import "@fontsource-variable/nunito"
import "./root.css"

import { ClerkApp, useAuth } from "@clerk/remix"
import { rootAuthLoader } from "@clerk/remix/ssr.server"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react"
import { ConvexReactClient } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { Suspense, useState } from "react"
import { clientEnv } from "./env.ts"
import { clerkConfig } from "./modules/clerk/config.ts"
import { getSiteMeta } from "./modules/meta/helpers.ts"
import { PromptProvider } from "./ui/Prompt.tsx"
import { Toaster } from "./ui/Toaster.tsx"

export const loader = (args: LoaderFunctionArgs) => rootAuthLoader(args)

export const meta: MetaFunction = () => getSiteMeta()

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="break-words bg-primary-100 text-primary-900">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<div className="isolate">
					<PromptProvider>
						<Toaster>
							<Suspense>{children}</Suspense>
						</Toaster>
					</PromptProvider>
				</div>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

export default ClerkApp(function App() {
	const [convex] = useState(() => new ConvexReactClient(clientEnv.VITE_CONVEX_URL))
	return (
		<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
			<Outlet />
		</ConvexProviderWithClerk>
	)
}, clerkConfig)
