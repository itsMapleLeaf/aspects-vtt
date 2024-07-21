import { useAuthActions } from "@convex-dev/auth/react"
import { LucideLogOut, LucideSettings, LucideUser } from "lucide-react"
import { Button } from "../../ui/button.tsx"
import { Menu } from "../../ui/menu.tsx"
import { Modal } from "../../ui/modal.tsx"
import { AccountSettingsForm } from "./account-settings-form.tsx"

export function UserButton() {
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
