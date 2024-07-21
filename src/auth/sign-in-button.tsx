import { useAuthActions } from "@convex-dev/auth/react"
import { SiDiscord } from "@icons-pack/react-simple-icons"
import { LucideDoorOpen, LucideLogIn, LucideUserPlus } from "lucide-react"
import { useActionState, useState } from "react"
import { Button } from "../ui/button.tsx"
import { Form, FormError } from "../ui/form.tsx"
import { Heading } from "../ui/heading.tsx"
import { InputField } from "../ui/input.tsx"
import { Column, Row } from "../ui/layout.tsx"
import { Modal } from "../ui/modal.tsx"

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
			<Button icon={<LucideLogIn />} element={<Modal.Button />}>
				Sign in / sign up
			</Button>

			<Modal.Panel
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
						<Button type="submit" icon={<SiDiscord />} className="w-full">
							Continue with Discord
						</Button>
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
			</Modal.Panel>
		</Modal>
	)
}

function OrDivider() {
	return (
		<Row className="w-full items-center gap-2">
			<div className="h-px flex-1 bg-base-700"></div>
			<p className="text-base-400">or</p>
			<div className="h-px flex-1 bg-base-700"></div>
		</Row>
	)
}

function LoginFields() {
	return (
		<>
			<InputField type="text" name="handle" label="Account handle" required />
			<InputField type="password" name="password" label="Password" required />
			<Button type="submit" className="self-center" icon={<LucideDoorOpen />}>
				Sign in
			</Button>
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
			<Button type="submit" className="self-center" icon={<LucideUserPlus />}>
				Create account
			</Button>
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
		<p className="text-center text-base-400">
			{message}{" "}
			<button
				type="button"
				onClick={onSwitch}
				className="cursor-pointer text-base-200 underline hover:no-underline"
			>
				{buttonText}
			</button>
		</p>
	)
}
