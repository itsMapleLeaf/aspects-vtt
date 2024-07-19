import { useAuthActions } from "@convex-dev/auth/react"
import { Link } from "@remix-run/react"
import { LucideLogOut, LucideUser } from "lucide-react"
import { AppLogo } from "../ui/app-logo.tsx"
import { Button } from "../ui/button.tsx"
import { Heading } from "../ui/heading.tsx"
import { Column, Row } from "../ui/layout.tsx"
import { Menu } from "../ui/menu.tsx"

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
				<AccountActionsButton />
			</Row>
			<p>room list here</p>
			<form action={auth.signOut}>
				<button type="submit">sign out</button>
			</form>
		</Column>
	)
}

function AccountActionsButton() {
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
				{/* <Menu.Item icon={<LucideSettings />}>Account settings</Menu.Item> */}
				<form action={actions.signOut}>
					<Menu.Item type="submit" icon={<LucideLogOut />}>
						Sign out
					</Menu.Item>
				</form>
			</Menu.Panel>
		</Menu>
	)
}
