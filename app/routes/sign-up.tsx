import { useNavigate } from "@remix-run/react"
import { useAction } from "convex/react"
import { LucideLogIn } from "lucide-react"
import { useState } from "react"
import { $path } from "remix-routes"
import { z } from "zod"
import { Button } from "#app/ui/Button.js"
import { FormField } from "#app/ui/FormField.js"
import { Input } from "#app/ui/Input.js"
import { api } from "#convex/_generated/api.js"

const schema = z.object({
	username: z.string().min(3).max(64),
	password: z.string().min(8),
})

export default function SignUp() {
	const register = useAction(api.auth.register)
	const navigate = useNavigate()
	const [errors, setError] = useState<z.typeToFlattenedError<z.output<typeof schema>, string>>()

	const action = async (formData: FormData) => {
		const result = schema.safeParse(Object.fromEntries(formData))
		if (!result.success) {
			setError(result.error.flatten())
			return
		}

		const [registerResult, registerError] = await register(result.data)
		if (!registerResult) {
			setError({ formErrors: [registerError], fieldErrors: {} })
			return
		}

		localStorage.setItem("sessionId", registerResult.sessionId)
		navigate($path("/"))
	}

	return (
		<main className="p-8">
			<h1 className="mb-4 font-light text-3xl">Sign in or register to get started</h1>
			<form action={action} className="flex max-w-72 flex-col gap-4">
				<FormField label="Username" htmlFor="username">
					<Input type="text" id="username" name="username" placeholder="Username" />
					<FormError>{errors?.fieldErrors.username}</FormError>
				</FormField>
				<FormField label="Password" htmlFor="password">
					<Input type="password" id="password" name="password" placeholder="••••••••" />
					<FormError>{errors?.fieldErrors.password}</FormError>
				</FormField>
				<div>
					<Button type="submit" text="Sign In" icon={<LucideLogIn />} />
				</div>
				<FormError>{errors?.formErrors}</FormError>
			</form>
		</main>
	)
}

function FormError({ children }: { children: string | string[] | undefined | null }) {
	return (
		<ul className="text-red-400 text-sm empty:hidden">
			{[children]
				.flat()
				.filter(Boolean)
				.map((error) => (
					<li key={error}>{error}</li>
				))}
		</ul>
	)
}
