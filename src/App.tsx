import { useAuthActions } from "@convex-dev/auth/react"

export function App() {
	const auth = useAuthActions()
	return (
		<button
			onClick={() => {
				auth.signIn("discord").catch(console.error)
			}}
		>
			Sign in with Discord
		</button>
	)
}
