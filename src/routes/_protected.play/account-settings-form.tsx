import { useMutation, useQuery } from "convex/react"
import { LucideSave } from "lucide-react"
import { api } from "../../../convex/_generated/api.js"
import { Button } from "../../ui/button.tsx"
import { InputField } from "../../ui/input.tsx"

export function AccountSettingsForm() {
	const user = useQuery(api.users.me)
	const update = useMutation(api.users.update)
	return user == null ? null : (
		<form
			className="grid gap-3"
			action={(form) =>
				update({
					name: form.get("name") as string,
					handle: form.get("handle") as string,
				})
			}
		>
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
			<Button
				type="submit"
				className="justify-self-start"
				icon={<LucideSave />}
			>
				Save
			</Button>
		</form>
	)
}
