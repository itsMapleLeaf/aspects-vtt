import { Link, useSearchParams } from "@remix-run/react"
import { LucideLogIn, LucideUserPlus } from "lucide-react"
import * as v from "valibot"
import { nonEmptyShortText } from "~/common/validators.ts"
import { Button } from "~/components/Button.tsx"
import { Heading } from "~/components/Heading.tsx"
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
			className={panel("flex w-full max-w-sm flex-col p-gap shadow-md gap-3")}
		>
			<Heading className={primaryHeading()}>
				{action === "login" ? "Sign in" : "Sign up"}
			</Heading>
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
					className="self-center text-sm font-semibold text-primary-200 underline"
					to="?action=register"
				>
					Create an account
				</Link>
			) : (
				<Link
					className="self-center text-sm font-semibold text-primary-200 underline"
					to="?action=login"
				>
					Already have an account?
				</Link>
			)}
		</Form>
	)
}
