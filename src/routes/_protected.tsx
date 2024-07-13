import { useAuthActions } from "@convex-dev/auth/react"
import { SiDiscord } from "@icons-pack/react-simple-icons"
import { Outlet } from "@remix-run/react"
import { useConvexAuth, useQuery } from "convex/react"
import { LucideDoorOpen, LucideUserPlus } from "lucide-react"
import { useState } from "react"
import { api } from "../../convex/_generated/api.js"
import { Button } from "../ui/button.tsx"
import { FormError } from "../ui/form.tsx"
import { Heading, HeadingLevel } from "../ui/heading.tsx"
import { InputField } from "../ui/input.tsx"
import { Column, Row } from "../ui/layout.tsx"
import { LoadingCover } from "../ui/loading.tsx"
import { Panel } from "../ui/panel.tsx"

export default function ProtectedLayout() {
	const user = useQuery(api.users.me)
	const auth = useConvexAuth()
	const loading = user === undefined || auth.isLoading
	return (
		<>
			{loading ? null : user === null ? <AuthForm /> : <Outlet />}
			<LoadingCover visible={loading} />
		</>
	)
}

function AuthForm() {
	const auth = useAuthActions()
	const [action, setAction] = useState<"login" | "register">("login")
	const [error, setError] = useState<string>()

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const form = new FormData(event.currentTarget)
		auth.signIn("credentials", form).catch((error) => {
			if (error instanceof Error) {
				setError(error.message)
			} else {
				setError(String(error))
			}
		})
	}

	return (
		<main className="flex h-screen min-h-fit flex-col gap-6 px-4 py-24 *:mx-auto *:shrink-0 first:*:mt-auto last:*:mb-auto">
			<HeadingLevel>
				<Heading className="max-w-80 text-balance text-center text-4xl">
					{action === "login" ? "Sign in" : "Create an account"} to continue.
				</Heading>

				<Panel className="w-[320px] p-4">
					<Column className="items-center">
						<Button
							icon={<SiDiscord />}
							onClick={() => {
								auth.signIn("discord").catch(console.error)
							}}
						>
							Continue with Discord
						</Button>

						<Row className="w-full items-center gap-2">
							<div className="h-px flex-1 bg-base-700"></div>
							<p className="text-base-400">or</p>
							<div className="h-px flex-1 bg-base-700"></div>
						</Row>

						<Heading className="text-xl">
							{action === "register" ? "Register" : "Sign in"} with a password
						</Heading>

						<form
							onSubmit={(event) => {
								handleSubmit(event)
							}}
							className="flex w-full flex-col gap-4"
						>
							<InputField
								type="text"
								name="handle"
								label="Account handle"
								description={
									action === "register" &&
									"You'll use this to sign in. Only use letters, numbers, underscores (_) and periods (.)."
								}
								required
							/>

							{action === "register" && (
								<InputField
									type="text"
									name="name"
									label="Display name"
									description={
										action === "register" && "This is the name others will see."
									}
									required
								/>
							)}

							<InputField
								type="password"
								name="password"
								label="Password"
								description={action === "register" && "Make it strong!"}
								required
							/>

							<input type="hidden" name="action" value={action} />

							<Button
								type="submit"
								className="self-center"
								icon={
									action === "login" ? <LucideDoorOpen /> : <LucideUserPlus />
								}
							>
								{action === "login" ? "Sign in" : "Create account"}
							</Button>

							{error && <FormError>{error}</FormError>}
						</form>
					</Column>
				</Panel>

				<p className="text-center text-base-400">
					{action === "login" && (
						<>
							don't have an account?{" "}
							<button
								type="button"
								onClick={() => setAction("register")}
								className="cursor-pointer text-base-200 underline hover:no-underline"
							>
								register
							</button>
						</>
					)}
					{action === "register" && (
						<>
							already have an account?{" "}
							<button
								type="button"
								onClick={() => setAction("login")}
								className="cursor-pointer text-base-200 underline hover:no-underline"
							>
								sign in
							</button>
						</>
					)}
				</p>
			</HeadingLevel>
		</main>
	)
}
