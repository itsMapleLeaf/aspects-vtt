import { installIntoGlobal } from "iterator-helpers-polyfill"
installIntoGlobal()

import "@fontsource-variable/nunito"
import "./root.css"

import { ClerkApp, ClerkLoading, SignInButton, SignUpButton, useAuth } from "@clerk/remix"
import { rootAuthLoader } from "@clerk/remix/ssr.server"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useHref,
	useLocation,
} from "@remix-run/react"
import { AuthLoading, Authenticated, ConvexReactClient, Unauthenticated } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import * as Lucide from "lucide-react"
import { clerkConfig } from "./clerk.ts"
import { clientEnv } from "./env.ts"
import { AppHeaderLayout } from "./ui/AppHeaderLayout.tsx"
import { Button } from "./ui/Button.tsx"
import { EmptyStatePanel } from "./ui/EmptyState.tsx"
import { Loading } from "./ui/Loading.tsx"
import { PromptProvider } from "./ui/Prompt.tsx"

const convex = new ConvexReactClient(clientEnv.VITE_CONVEX_URL)

export const loader = (args: LoaderFunctionArgs) => rootAuthLoader(args)

export const meta: MetaFunction = () => [
	{ title: "Aspects VTT" },
	{ name: "description", content: "A virtual tabletop for the Aspects of Nature tabletop RPG" },
]

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="touch-none text-balance break-words bg-primary-100 text-primary-900">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<PromptProvider>{children}</PromptProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

export default ClerkApp(function App() {
	return (
		<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
			<AuthLoading>
				<Loading fill="screen" />
			</AuthLoading>
			<Unauthenticated>
				<UnauthenticatedMessage />
			</Unauthenticated>
			<Authenticated>
				<Outlet />
			</Authenticated>
		</ConvexProviderWithClerk>
	)
}, clerkConfig)

function UnauthenticatedMessage() {
	const currentUrl = useHref(useLocation())
	return (
		<AppHeaderLayout>
			<main>
				<EmptyStatePanel
					icon={<Lucide.Lock />}
					message="You must be signed in to continue."
					actions={
						<>
							<ClerkLoading>
								<Loading size="sm" />
							</ClerkLoading>
							<SignInButton mode="modal" forceRedirectUrl={currentUrl}>
								<Button icon={<Lucide.LogIn />} text="Sign in" />
							</SignInButton>
							<SignUpButton mode="modal" forceRedirectUrl={currentUrl}>
								<Button icon={<Lucide.UserPlus />} text="Create account" />
							</SignUpButton>
						</>
					}
				/>
			</main>
		</AppHeaderLayout>
	)
}
