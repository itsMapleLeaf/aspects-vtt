import { Outlet } from "@remix-run/react"
import { useConvexAuth } from "convex/react"
import { LoadingCover } from "~/components/LoadingCover.tsx"
import { AuthForm } from "~/features/auth/AuthForm.tsx"

export default function ProtectedLayout() {
	const auth = useConvexAuth()
	return (
		<>
			{auth.isLoading ? null : auth.isAuthenticated ? (
				<Outlet />
			) : (
				<main className="absolute inset-0 flex size-full flex-col *:m-auto">
					<AuthForm />
				</main>
			)}
			<LoadingCover visible={auth.isLoading} />
		</>
	)
}
