import { useAuthActions } from "@convex-dev/auth/react"
import { useQuery } from "convex/react"
import { ConvexError } from "convex/values"
import { useState } from "react"
import { api } from "../convex/_generated/api.js"
import { Doc } from "../convex/_generated/dataModel.js"

export function App() {
	const user = useQuery(api.auth.me)
	return user === undefined ? (
		<p>Loading...</p>
	) : user === null ? (
		<AuthForm />
	) : (
		<WelcomeMessage user={user} />
	)
}

function WelcomeMessage({ user }: { user: Doc<"users"> }) {
	const auth = useAuthActions()
	return (
		<>
			<p>hi, {user.name}!</p>
			<button
				onClick={() => {
					auth.signOut().catch(console.error)
				}}
			>
				Sign out
			</button>
		</>
	)
}

function AuthForm() {
	const auth = useAuthActions()
	const [flow, setFlow] = useState<"signIn" | "signUp">("signIn")
	const [error, setError] = useState<string>()

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const form = new FormData(event.currentTarget)
		auth.signIn("password", form).catch((error) => {
			if (error instanceof ConvexError) {
				setError(error.message)
			} else {
				setError("Something went wrong, please try again.")
			}
		})
	}

	return (
		<main>
			<button
				onClick={() => {
					auth.signIn("discord").catch(console.error)
				}}
			>
				Sign in with Discord
			</button>
			<hr />
			<form
				onSubmit={(event) => {
					handleSubmit(event)
				}}
			>
				<label htmlFor="email">Email</label>
				<input type="text" name="email" id="email" />

				{flow === "signUp" && (
					<>
						<label htmlFor="name">Display name</label>
						<input type="text" name="name" id="name" />
					</>
				)}

				<label htmlFor="password">Password</label>
				<input type="password" name="password" id="password" />

				<input type="hidden" name="flow" value={flow} />

				<button type="submit">
					{flow === "signIn" ? "Sign in" : "Create account"}
				</button>

				{flow === "signIn" && (
					<p>
						or{" "}
						<button onClick={() => setFlow("signUp")}>create an account</button>
					</p>
				)}
				{flow === "signUp" && (
					<p>
						or <button onClick={() => setFlow("signIn")}>sign in</button>
					</p>
				)}

				{error && <p>{error}</p>}
			</form>
		</main>
	)
}
