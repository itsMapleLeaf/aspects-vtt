import { useMutation, useQuery } from "convex/react"
import { ConvexError } from "convex/values"
import { LucideSave } from "lucide-react"
import { useActionState } from "react"
import { api } from "~/convex/_generated/api.js"
import { InputField } from "../../ui/input.tsx"
import { Loading } from "../../ui/loading.tsx"
import {
	errorText,
	formLayout,
	heading2xl,
	solidButton,
} from "../../ui/styles.ts"

export function AccountSettingsForm() {
	const user = useQuery(api.users.me)
	const update = useMutation(api.users.update)

	const [errorMessage, action, pending] = useActionState(
		async (_: string | undefined, form: FormData) => {
			try {
				await update({
					name: form.get("name") as string,
					handle: form.get("handle") as string,
				})
			} catch (error) {
				if (error instanceof ConvexError) {
					return error.data
				}
				console.error(error)
				return "Oops, something went wrong. Try again."
			}
		},
	)

	return user == null ? null : (
			<form className={formLayout()} action={action}>
				<h2 className={heading2xl()}>Account settings</h2>
				<InputField
					type="text"
					name="handle"
					label="Handle"
					description="Your handle uniquely identifies you, and you use it to sign in."
					required
					defaultValue={user.handle}
				/>
				<InputField
					type="text"
					name="name"
					label="Display name"
					description="This is the name others will see."
					required
					defaultValue={user.name}
				/>
				{errorMessage && <p className={errorText()}>{errorMessage}</p>}
				<button type="submit" className={solidButton("self-start")}>
					{pending ?
						<Loading data-button-icon />
					:	<LucideSave />}{" "}
					Save
				</button>
			</form>
		)
}
