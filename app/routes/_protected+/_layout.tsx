import { Button } from "#app/ui/Button.js"
import { Loading } from "#app/ui/Loading.js"
import { SignedIn, SignedOut } from "@clerk/remix"
import { Link, Outlet } from "@remix-run/react"
import { AuthLoading } from "convex/react"
import * as Lucide from "lucide-react"
import { AppHeaderLayout } from "../../ui/AppHeaderLayout"
import { EmptyState } from "../../ui/EmptyState"

export default function ProtectedLayoutRoute() {
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
									<Button icon={<Lucide.LogIn />} text="Sign in" element={<Link to="/sign-in" />} />
									<Button
										icon={<Lucide.UserPlus />}
										text="Create account"
										element={<Link to="/sign-up" />}
									/>
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
