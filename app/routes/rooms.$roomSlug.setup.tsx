import { type ActionFunctionArgs, redirect } from "@remix-run/node"
import { Form, useSearchParams } from "@remix-run/react"
import * as Lucide from "lucide-react"
import { $params, $path } from "remix-routes"
import { updatePreferences } from "~/preferences.server.ts"
import { Button } from "~/ui/Button.tsx"
import { Input } from "~/ui/Input.tsx"

export async function action({ request, params }: ActionFunctionArgs) {
	const { roomSlug } = $params("/rooms/:roomSlug", params)
	const formData = await request.formData()
	return updatePreferences(
		{ username: formData.get("username") as string },
		redirect($path("/rooms/:roomSlug", { roomSlug })),
	)
}

export default function RoomRoute() {
	const [searchParams] = useSearchParams()
	return (
		<main className="flex h-dvh flex-col items-center">
			<Form method="post" action="" className="m-auto flex flex-col items-center gap-3 rounded-md">
				<label htmlFor="username" className="text-3xl font-light text-primary-900/75">
					What should we call you?
				</label>

				<div className="flex gap-1">
					<Input
						id="username"
						name="username"
						placeholder="cute felirian"
						icon={<Lucide.Cat />}
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
					<Button type="submit" text="Enter" icon={<Lucide.LogIn />} />
				</div>
			</Form>
		</main>
	)
}
