import { useAuthActions } from "@convex-dev/auth/react"
import { Link } from "@remix-run/react"
import { useQuery } from "convex/react"
import { LucideLogOut, LucideSettings, LucideUser } from "lucide-react"
import { api } from "../../convex/_generated/api.js"
import { Button } from "../ui/button.tsx"
import { Loading } from "../ui/loading.tsx"
import { Menu } from "../ui/menu.tsx"
import { Modal } from "../ui/modal.tsx"
import { AccountSettingsForm } from "./account-settings-form.tsx"

export function UserButton() {
	const user = useQuery(api.users.me)
	const actions = useAuthActions()
	return user === undefined ? (
		<Loading />
	) : user === null ? (
		<Button element={<Link to="/play" />} icon={<LucideUser />}>
			Sign in / register
		</Button>
	) : (
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
