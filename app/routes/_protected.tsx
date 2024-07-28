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
import { FormActions, FormField, FormLayout } from "~/ui/Form.tsx"
import { Input } from "~/ui/Input.tsx"
import { Loading } from "~/ui/Loading.tsx"
import { ModalButton, ModalPanel, ModalProvider } from "~/ui/Modal.tsx"
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
						<>
							<form action={() => auth.signIn("discord", { redirectTo: currentUrl })}>
								<Button icon={<SiDiscord />}>Sign in with Discord</Button>
							</form>
							{(import.meta.env.DEV || import.meta.env.MODE === "test") && <TestSignInButton />}
						</>
					}
				/>
			</main>
		</AppHeaderLayout>
	)
}
function TestSignInButton() {
	const auth = useAuthActions()
	const currentUrl = useHref(useLocation())
	return (
		<ModalProvider>
			<ModalButton render={<Button icon={<Lucide.TestTube2 />} />}>Test sign in</ModalButton>
			<ModalPanel title="Test sign in">
				<form
					action={(form) =>
						auth.signIn("test", { id: String(form.get("id")), redirectTo: currentUrl })
					}
				>
					<FormLayout>
						<FormField label="User ID" htmlFor="id">
							<Input id="id" name="id" defaultValue="testuser" />
						</FormField>
						<FormActions>
							<Button type="submit" icon={<Lucide.LogIn />}>
								Sign in
							</Button>
						</FormActions>
					</FormLayout>
				</form>
			</ModalPanel>
		</ModalProvider>
	)
}
