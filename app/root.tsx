import { installIntoGlobal } from "iterator-helpers-polyfill"
installIntoGlobal()

import "@fontsource-variable/nunito"
import "./root.css"

import { ConvexAuthProvider } from "@convex-dev/auth/react"
import type { MetaFunction } from "@remix-run/node"
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react"
import { ConvexReactClient } from "convex/react"
import { Suspense, useState } from "react"
import { raise } from "./helpers/errors.ts"
import { getSiteMeta } from "./modules/meta/helpers.ts"
import { PromptProvider } from "./ui/Prompt.tsx"
import { Toaster } from "./ui/Toaster.tsx"

export const meta: MetaFunction = () => getSiteMeta()

export const loader = () => {
	return {
		convexUrl:
			process.env.CONVEX_URL ||
			process.env.VITE_CONVEX_URL ||
			import.meta.env.VITE_CONVEX_URL ||
			raise("CONVEX_URL not set"),
	}
}

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

export default function App() {
	const { convexUrl } = useLoaderData<typeof loader>()
	const [convex] = useState(() => new ConvexReactClient(convexUrl))
	return (
		<ConvexAuthProvider client={convex}>
			<Outlet />
		</ConvexAuthProvider>
	)
}
