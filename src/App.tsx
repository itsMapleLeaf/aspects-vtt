import { useAuthActions } from "@convex-dev/auth/react"
import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useQuery,
} from "convex/react"
import { api } from "../convex/_generated/api.js"

export function App() {
	const auth = useAuthActions()
	const user = useQuery(api.auth.me)
	return (
		<>
			<AuthLoading>Loading...</AuthLoading>
			<Authenticated>
				<p>hi, {user?.name}!</p>
			</Authenticated>
			<Unauthenticated>
				<button
					onClick={() => {
						auth.signIn("discord").catch(console.error)
					}}
				>
					Sign in with Discord
				</button>
			</Unauthenticated>
		</>
	)
}
