import { useAuthActions } from "@convex-dev/auth/react"
import { SiDiscord } from "@icons-pack/react-simple-icons"
import { useHref, useLocation } from "@remix-run/react"
import { LucideDoorOpen, LucideUserPlus } from "lucide-react"
import { useActionState, useState } from "react"
import { Button } from "../../ui/button.tsx"
import { FormError } from "../../ui/form.tsx"
import { Heading, HeadingLevel } from "../../ui/heading.tsx"
import { InputField } from "../../ui/input.tsx"
import { Column, Row } from "../../ui/layout.tsx"
import { Panel } from "../../ui/panel.tsx"

export function AuthForm() {
	const [action, setAction] = useState<"login" | "register">("login")
	const auth = useAuthActions()
	const currentUrl = useHref(useLocation())

	const [error, handleSubmit] = useActionState(async function handleSubmit(
		_state: string | undefined,
		form: FormData,
	) {
		try {
			await auth.signIn("credentials", {
				...Object.fromEntries(form),
				action,
				redirectTo: currentUrl,
			})
		} catch (error) {
			return error instanceof Error ? error.message : String(error)
		}
	})

	return (
		<main className="flex h-screen min-h-fit flex-col gap-6 px-4 py-24 *:mx-auto *:shrink-0 first:*:mt-auto last:*:mb-auto">
			<HeadingLevel>
				<Heading className="max-w-80 text-balance text-center text-4xl">
					{action === "login" ? "Sign in" : "Create an account"} to continue.
				</Heading>

				<Panel className="w-[320px] p-4">
					<Column className="items-center">
						<form action={() => auth.signIn("discord")}>
							<Button type="submit" icon={<SiDiscord />}>
								Continue with Discord
							</Button>
						</form>

						<OrDivider />

						<Heading className="text-xl">
							{action === "register" ? "Register" : "Sign in"} with a password
						</Heading>

						<form action={handleSubmit} className="flex w-full flex-col gap-4">
							{action === "login" ? <LoginFields /> : <RegisterFields />}
							{error && <FormError>{error}</FormError>}
						</form>
					</Column>
				</Panel>

				{action === "login" ? (
					<ActionSwitchMessage
						message="don't have an account?"
						buttonText="register"
						onSwitch={() => setAction("register")}
					/>
				) : (
					<ActionSwitchMessage
						message="already have an account?"
						buttonText="sign in"
						onSwitch={() => setAction("login")}
					/>
				)}
			</HeadingLevel>
		</main>
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
