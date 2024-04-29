import { ClerkLoading, SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/remix"
import { Outlet, useHref, useLocation } from "@remix-run/react"
import * as Lucide from "lucide-react"
import { AppHeaderLayout } from "../../ui/AppHeaderLayout"
import { Button } from "../../ui/Button.tsx"
import { EmptyStatePanel } from "../../ui/EmptyState"
import { Loading } from "../../ui/Loading.tsx"

export default function ProtectedLayoutRoute() {
	const currentUrl = useHref(useLocation())
	return (
		<>
			<SignedOut>
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
			</SignedOut>
			<SignedIn>
				<Outlet />
			</SignedIn>
		</>
	)
}
