import { installIntoGlobal } from "iterator-helpers-polyfill"
installIntoGlobal()

import "@fontsource-variable/nunito"
import "./root.css"

import { ClerkApp, useAuth } from "@clerk/remix"
import { rootAuthLoader } from "@clerk/remix/ssr.server"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import {
	defer,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from "@remix-run/react"
import { ConvexReactClient } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { Effect, pipe } from "effect"
import { Suspense, useState } from "react"
import { api } from "../convex/_generated/api"
import { clientEnv } from "./env.ts"
import { loaderFromEffect } from "./helpers/remix.ts"
import { UserContext } from "./modules/auth/UserContext.tsx"
import { clerkConfig } from "./modules/clerk/config.ts"
import { getConvexClient } from "./modules/convex/helpers.server.ts"
import { PromptProvider } from "./ui/Prompt.tsx"
import { Toaster } from "./ui/Toaster.tsx"

const setupUser = loaderFromEffect(
	Effect.gen(function* () {
		const convex = yield* getConvexClient()
		return yield* pipe(
			Effect.tryPromise(() => convex.mutation(api.auth.functions.setup, {})),
			Effect.orElseSucceed(() => null),
		)
	}),
)

export const loader = (args: LoaderFunctionArgs) =>
	rootAuthLoader(args, (args) => defer({ user: setupUser(args) }))

export const meta: MetaFunction = () => [
	{ title: "Aspects VTT" },
	{ description: "A virtual tabletop for the Aspects of Nature tabletop RPG" },
]

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
	const { user } = useLoaderData<typeof loader>()
	const [convex] = useState(() => new ConvexReactClient(clientEnv.VITE_CONVEX_URL))
	return (
		<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
			<UserContext value={user}>
				<Outlet />
			</UserContext>
		</ConvexProviderWithClerk>
	)
}, clerkConfig)
