import { useAuthActions } from "@convex-dev/auth/react"
// @ts-expect-error
import SiDiscord from "@icons-pack/react-simple-icons/icons/SiDiscord.mjs"
import { Outlet, useHref, useLocation } from "@remix-run/react"
import { useConvexAuth, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { Suspense } from "react"
import { AppHeaderLayout } from "~/ui/AppHeaderLayout.tsx"
import { Button } from "~/ui/Button.tsx"
import { EmptyStatePanel } from "~/ui/EmptyState.tsx"
import { Loading } from "~/ui/Loading.tsx"
import { api } from "../../convex/_generated/api.js"

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
	const user = useQuery(api.users.me)
	const state = useConvexAuth()
	const loading = user === undefined || state.isLoading

	return (
		loading ? <Loading fill="screen" />
		: user === null ? <UnauthenticatedMessage />
		: children
	)
}

function UnauthenticatedMessage() {
	const auth = useAuthActions()
	const currentUrl = useHref(useLocation())
	return (
		<AppHeaderLayout>
			<main>
				<EmptyStatePanel
					icon={<Lucide.Lock />}
					message="You must be signed in to continue."
					actions={
						<form action={() => auth.signIn("discord", { redirectTo: currentUrl })}>
							<Button icon={<SiDiscord />}>Sign in with Discord</Button>
						</form>
					}
				/>
			</main>
		</AppHeaderLayout>
	)
}
