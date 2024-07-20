import { useAuthActions } from "@convex-dev/auth/react"
import { Link } from "@remix-run/react"
import { useMutation, useQuery } from "convex/react"
import {
	LucideLogOut,
	LucideSave,
	LucideSettings,
	LucideUser,
} from "lucide-react"
import { api } from "../../convex/_generated/api.js"
import { AppLogo } from "../ui/app-logo.tsx"
import { Button } from "../ui/button.tsx"
import { Heading } from "../ui/heading.tsx"
import { InputField } from "../ui/input.tsx"
import { Column, Row } from "../ui/layout.tsx"
import { Menu } from "../ui/menu.tsx"
import { Modal } from "../ui/modal.tsx"

export default function PlayRoute() {
	const auth = useAuthActions()
	return (
		<Column className="items-stretch p-4">
			<Row className="items-center justify-between">
				<Button
					element={<Link to="/" />}
					icon={null}
					appearance="clear"
					className="h-12"
				>
					<Heading className="text-2xl">
						<AppLogo />
					</Heading>
				</Button>
				<UserButton />
			</Row>
		</Column>
	)
}

function UserButton() {
	const actions = useAuthActions()
	return (
		<Menu placement="bottom-end">
			<Button
				icon={<LucideUser />}
				appearance="clear"
				className="rounded-full"
				element={<Menu.Button />}
			/>
			<Menu.Panel>
				<Modal>
					<Menu.Item icon={<LucideSettings />} element={<Modal.Button />}>
						Account settings
					</Menu.Item>
					<Modal.Panel title="Account settings" className="grid gap-3 p-3">
						<AccountSettingsForm />
					</Modal.Panel>
				</Modal>
				<form action={actions.signOut} className="contents">
					<Menu.Item type="submit" icon={<LucideLogOut />}>
						Sign out
					</Menu.Item>
				</form>
			</Menu.Panel>
		</Menu>
	)
}

function AccountSettingsForm() {
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
