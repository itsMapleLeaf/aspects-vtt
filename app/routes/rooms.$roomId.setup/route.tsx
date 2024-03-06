import { type ActionFunctionArgs, redirect } from "@remix-run/node"
import { Form, useSearchParams } from "@remix-run/react"
import * as LucideIcons from "react-icons/lu"
import { Preferences } from "~/preferences.server.ts"
import { Button } from "~/ui/Button.tsx"
import { Input } from "~/ui/Input.tsx"

export async function action({ request, params }: ActionFunctionArgs) {
	const formData = await request.formData()
	const preferences = await Preferences.fromRequest(request)
	preferences.update({ username: formData.get("username") as string })
	return preferences.response(redirect(`/rooms/${params.roomId}`))
}

export default function RoomRoute() {
	const [searchParams] = useSearchParams()
	return (
		<main className="flex items-center flex-col h-dvh">
			<Form
				method="post"
				action=""
				className="m-auto rounded-md flex flex-col items-center gap-3"
			>
				<label
					htmlFor="username"
					className="text-3xl font-light text-primary-900/75"
				>
					What should we call you?
				</label>

				<div className="flex gap-1">
					<Input
						id="username"
						name="username"
						placeholder="cute felirian"
						icon={<LucideIcons.LuCat />}
						defaultValue={searchParams.get("username") ?? ""}
						required
						autoFocus
						onChange={(event) => {
							const lengthLimit = 50
							if (event.currentTarget.value.length > lengthLimit) {
								event.currentTarget.setCustomValidity(
									`Your name must be less than ${lengthLimit} characters.`,
								)
							} else {
								event.currentTarget.setCustomValidity("")
							}
						}}
					/>
					<Button type="submit" text="Enter" icon={<LucideIcons.LuLogIn />} />
				</div>
			</Form>
		</main>
	)
}
