import { useAuthActions } from "@convex-dev/auth/react"

export default function PlayRoute() {
	const auth = useAuthActions()
	return (
		<>
			<p>room list here</p>
			<button>account actions</button>
			<form action={auth.signOut}>
				<button type="submit">sign out</button>
			</form>
		</>
	)
}
