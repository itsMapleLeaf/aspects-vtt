import { Link, useSearchParams } from "react-router"
import { LucideLogIn, LucideUserPlus } from "lucide-react"
import * as v from "valibot"
import { Button } from "~/components/Button.tsx"
import { Heading } from "~/components/Heading.tsx"
import { nonEmptyShortText } from "~/lib/validators.ts"
import { panel } from "~/styles/panel.ts"
import { primaryHeading } from "~/styles/text.ts"
import { InputField } from "../forms/fields.tsx"
import { Form } from "../forms/Form.tsx"
import { useFields, useForm, valibotAction } from "../forms/useForm.ts"
import { useAuthActions } from "./useAuthActions.ts"

export function AuthForm() {
	const actions = useAuthActions()
	const [searchParams] = useSearchParams()

	const action =
		searchParams.get("action") === "register" ? "register" : "login"

	const form = useForm({
		initialValues: {
			username: "",
			password: "",
			confirmPassword: "",
		},
		action: valibotAction(
			v.pipe(
				v.object({
					username: nonEmptyShortText,
					password: v.pipe(
						v.string(),
						v.minLength(8, "Must be 8 characters or longer"),
						v.maxLength(100, "Must be 100 characters or less"),
					),
					confirmPassword: v.optional(v.string()),
				}),
				v.check((input) => {
					if (action === "login") return true
					return input.password === input.confirmPassword
				}, "Passwords don't match"),
			),
			(input) => {
				return actions.signInWithCredentials({
					action,
					username: input.username,
					password: input.password,
				})
			},
		),
	})

	const fields = useFields(form)

	return (
		<Form
			form={form}
			className={panel("p-gap flex w-full max-w-sm flex-col gap-3 shadow-md")}
		>
			<Heading className={primaryHeading()}>
				{action === "login" ? "Sign in" : "Sign up"}
			</Heading>

			<Button
				type="button"
				appearance="outline"
				icon={<DiscordLogo />}
				onClick={actions.signInWithDiscord}
			>
				Sign in with Discord
			</Button>

			<div className="my-2 flex items-center gap-2">
				<div className="bg-primary-700 h-px flex-1" />
				<span className="text-primary-200/75 text-sm">or</span>
				<div className="bg-primary-700 h-px flex-1" />
			</div>

			<InputField label="Username" field={fields.username} />
			<InputField label="Password" type="password" field={fields.password} />
			{action === "register" && (
				<InputField
					label="Confirm Password"
					type="password"
					field={fields.confirmPassword}
				/>
			)}
			<Button
				type="submit"
				icon={action === "login" ? <LucideLogIn /> : <LucideUserPlus />}
			>
				{action === "login" ? "Sign in" : "Sign up"}
			</Button>
			{action === "login" ? (
				<Link
					className="text-primary-200 self-center text-sm font-semibold underline"
					to="?action=register"
				>
					Create an account
				</Link>
			) : (
				<Link
					className="text-primary-200 self-center text-sm font-semibold underline"
					to="?action=login"
				>
					Sign in with existing account
				</Link>
			)}
		</Form>
	)
}

function DiscordLogo() {
	return (
		<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<title>Discord</title>
			<path
				fill="currentColor"
				d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"
			/>
		</svg>
	)
}
