import { useAuthActions } from "@convex-dev/auth/react"
import { Link } from "@remix-run/react"
import { useQuery } from "convex/react"
import { LucideLogOut, LucideSettings, LucideUser } from "lucide-react"
import { api } from "~/convex/_generated/api.js"
import { Loading } from "../../ui/loading.tsx"
import { Menu, MenuButton, MenuItem, MenuPanel } from "../../ui/menu.tsx"
import { Modal, ModalButton, ModalPanel } from "../../ui/modal.tsx"
import { clearCircleButton } from "../../ui/styles.ts"
import { AccountSettingsForm } from "./AccountSettingsForm.tsx"

export function UserButton() {
	const user = useQuery(api.entities.users.me)
	const actions = useAuthActions()
	return (
		user === undefined ? <Loading />
		: user === null ?
			<Link to="/" className="btn">
				Sign in / register
			</Link>
		:	<Menu placement="bottom-end">
				<MenuButton className={clearCircleButton()}>
					<LucideUser />
					<span className="sr-only">Account actions</span>
				</MenuButton>
				<MenuPanel unmountOnHide={false}>
					<Modal>
						<MenuItem render={<ModalButton />}>
							<LucideSettings /> Account settings
						</MenuItem>
						<ModalPanel
							title="Account settings"
							className="grid max-w-sm p-3 gap-3"
						>
							<AccountSettingsForm />
						</ModalPanel>
					</Modal>
					<form action={actions.signOut} className="contents">
						<MenuItem render={<button type="submit" />}>
							<LucideLogOut /> Sign out
						</MenuItem>
					</form>
				</MenuPanel>
			</Menu>
	)
}
