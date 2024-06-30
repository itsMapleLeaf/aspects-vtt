import { ClerkLoaded, ClerkLoading, SignInButton, SignUpButton } from "@clerk/remix"
import { Outlet, useHref, useLocation } from "@remix-run/react"
import { AuthLoading, Authenticated, Unauthenticated } from "convex/react"
import * as Lucide from "lucide-react"
import { Suspense } from "react"
import { useUser } from "~/modules/auth/hooks.ts"
import { AppHeaderLayout } from "~/ui/AppHeaderLayout.tsx"
import { Button } from "~/ui/Button.tsx"
import { EmptyStatePanel } from "~/ui/EmptyState.tsx"
import { Loading } from "~/ui/Loading.tsx"

export default function ProtectedRoute() {
	return (
		<ProtectedLayout>
			<Suspense fallback={<Loading fill="screen" />}>
				<Outlet />
			</Suspense>
		</ProtectedLayout>
	)
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<AuthLoading>
				<Loading fill="screen" />
			</AuthLoading>
			<Unauthenticated>
				<UnauthenticatedMessage />
			</Unauthenticated>
			<Authenticated>
				<UserGuard>{children}</UserGuard>
			</Authenticated>
		</>
	)
}

function UserGuard({ children }: { children: React.ReactNode }) {
	const user = useUser()
	return user ? children : <Loading fill="screen" />
}

function UnauthenticatedMessage() {
	const currentUrl = useHref(useLocation())
	return (
		<AppHeaderLayout>
			<ClerkLoading>
				<Loading />
			</ClerkLoading>
			<ClerkLoaded>
				<main>
					<EmptyStatePanel
						icon={<Lucide.Lock />}
						message="You must be signed in to continue."
						actions={
							<>
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
			</ClerkLoaded>
		</AppHeaderLayout>
	)
}
