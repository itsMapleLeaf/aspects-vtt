import { ClerkLoading, SignInButton, SignUpButton } from "@clerk/remix"
import { useHref, useLocation } from "@remix-run/react"
import { AuthLoading, Authenticated, Unauthenticated } from "convex/react"
import * as Lucide from "lucide-react"
import { AppHeaderLayout } from "../../ui/AppHeaderLayout.tsx"
import { Button } from "../../ui/Button.tsx"
import { EmptyStatePanel } from "../../ui/EmptyState.tsx"
import { Loading } from "../../ui/Loading.tsx"

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<AuthLoading>
				<Loading fill="screen" />
			</AuthLoading>
			<Unauthenticated>
				<UnauthenticatedMessage />
			</Unauthenticated>
			<Authenticated>{children}</Authenticated>
		</>
	)
}

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
