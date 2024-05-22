import {
	ClerkLoaded,
	ClerkLoading,
	SignInButton,
	SignUpButton,
} from "@clerk/remix"
import { useHref, useLocation } from "@remix-run/react"
import { AuthLoading, Authenticated, Unauthenticated } from "convex/react"
import * as Lucide from "lucide-react"
import { NotionDataProvider } from "../../features/game/NotionDataContext.tsx"
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
			<Authenticated>
				<NotionDataProvider>{children}</NotionDataProvider>
			</Authenticated>
		</>
	)
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
