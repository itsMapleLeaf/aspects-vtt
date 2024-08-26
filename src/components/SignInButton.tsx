import { useAuthActions } from "@convex-dev/auth/react"
import { SiDiscord } from "@icons-pack/react-simple-icons"
import { LucideDoorOpen, LucideLogIn, LucideUserPlus } from "lucide-react"
import { useActionState, useState } from "react"
import { Form, FormError } from "../ui/form.tsx"
import { Heading } from "../ui/heading.tsx"
import { InputField } from "../ui/input.tsx"
import { Column, Row } from "../ui/layout.tsx"
import { Modal, ModalButton, ModalPanel } from "../ui/modal.tsx"

export function SignInButton() {
	const [action, setAction] = useState<"login" | "register">("login")
	const auth = useAuthActions()

	const [error, handleSubmit] = useActionState(async function handleSubmit(
		_state: string | undefined,
		form: FormData,
	) {
		try {
			await auth.signIn("credentials", {
				...Object.fromEntries(form),
				action,
			})
		} catch (error) {
			return error instanceof Error ? error.message : String(error)
		}
	})

	return (
		<Modal>
			<ModalButton className="btn">
				<LucideLogIn /> Sign in / sign up
			</ModalButton>

			<ModalPanel
				title={`${action === "login" ? "Sign in" : "Sign up"} to continue.`}
				className="flex w-80 flex-col gap-6 p-4 text-center"
			>
				<Column items="stretch">
					<form
						action={async () => {
							await auth.signIn("discord", {
								redirectTo: window.location.pathname,
							})
						}}
					>
						<button type="submit" className="btn">
							<SiDiscord /> Continue with Discord
						</button>
					</form>

					<OrDivider />

					<Heading className="text-balance text-xl">
						{action === "register" ? "Sign up" : "Sign in"} with username &
						password
					</Heading>

					<Form action={handleSubmit}>
						{action === "login" ? <LoginFields /> : <RegisterFields />}
						{error && <FormError>{error}</FormError>}
					</Form>
				</Column>

				{action === "login" ? (
					<ActionSwitchMessage
						message="don't have an account?"
						buttonText="sign up"
						onSwitch={() => setAction("register")}
					/>
				) : (
					<ActionSwitchMessage
						message="already have an account?"
						buttonText="sign in"
						onSwitch={() => setAction("login")}
					/>
				)}
			</ModalPanel>
		</Modal>
	)
}

function OrDivider() {
	return (
		<Row className="w-full items-center gap-2">
			<div className="bg-base-content/25 h-px flex-1"></div>
			<p className="text-base-400">or</p>
			<div className="bg-base-content/25 h-px flex-1"></div>
		</Row>
	)
}

function LoginFields() {
	return (
		<>
			<InputField type="text" name="handle" label="Account handle" required />
			<InputField type="password" name="password" label="Password" required />
			<button type="submit" className="btn">
				<LucideDoorOpen /> Sign in
			</button>
		</>
	)
}

function RegisterFields() {
	return (
		<>
			<InputField
				type="text"
				name="handle"
				label="Account handle"
				description="You'll use this to sign in. Only use letters, numbers, underscores (_) and periods (.)."
				required
			/>
			<InputField
				type="text"
				name="name"
				label="Display name"
				description="This is the name others will see."
				required
			/>
			<InputField
				type="password"
				name="password"
				label="Password"
				description="Make it strong!"
				required
			/>
			<button type="submit" className="btn">
				<LucideUserPlus /> Create account
			</button>
		</>
	)
}

function ActionSwitchMessage({
	message,
	buttonText,
	onSwitch,
}: {
	message: string
	buttonText: string
	onSwitch: () => void
}) {
	return (
		<p className="text-center">
			{message}{" "}
			<button
				type="button"
				onClick={onSwitch}
				className="cursor-pointer underline hover:no-underline"
			>
				{buttonText}
			</button>
		</p>
	)
}
