import { useConvexAuth, useQuery } from "convex/react"
import { LucideLogIn } from "lucide-react"
import { api } from "../../convex/_generated/api.js"
import { EmptyState } from "../ui/empty-state.tsx"
import { LoadingCover } from "../ui/loading.tsx"
import { SignInButton } from "./SignInButton.tsx"

export function ProtectedLayout({
	children,
	fallback = (
		<EmptyState title="Sign in to continue" icon={<LucideLogIn />}>
			<SignInButton />
		</EmptyState>
	),
}: {
	children: React.ReactNode
	fallback?: React.ReactNode
}) {
	const user = useQuery(api.functions.users.me)
	const auth = useConvexAuth()
	const loading = user === undefined || auth.isLoading
	return (
		<>
			{loading ?
				null
			: user === null ?
				fallback
			:	children}
			<LoadingCover visible={loading} />
		</>
	)
}
