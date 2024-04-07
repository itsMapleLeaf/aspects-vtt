import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/remix"
import { Outlet, useHref, useLocation } from "@remix-run/react"
import { AuthLoading } from "convex/react"
import * as Lucide from "lucide-react"
import { Button } from "#app/ui/Button.js"
import { Loading } from "#app/ui/Loading.js"
import { AppHeaderLayout } from "../../ui/AppHeaderLayout"
import { EmptyState } from "../../ui/EmptyState"

export default function ProtectedLayoutRoute() {
	const currentUrl = useHref(useLocation())
	return (
		<>
			<AuthLoading>
				<div className="flex-center-col h-dvh">
					<Loading />
				</div>
			</AuthLoading>

			<SignedOut>
				<AppHeaderLayout>
					<main>
						<EmptyState
							icon={<Lucide.Lock />}
							message="You must be signed in to continue."
							actions={
								<>
									<SignInButton mode="modal" redirectUrl={currentUrl}>
										<Button icon={<Lucide.LogIn />} text="Sign in" />
									</SignInButton>
									<SignUpButton mode="modal" redirectUrl={currentUrl}>
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
