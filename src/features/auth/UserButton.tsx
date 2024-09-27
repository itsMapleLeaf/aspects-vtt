import { useQuery } from "convex/react"
import { LogOut } from "lucide-react"
import { Avatar } from "~/components/Avatar.tsx"
import { Button } from "~/components/Button.tsx"
import { Menu } from "~/components/Menu.tsx"
import { api } from "~/convex/_generated/api.js"
import { useAuthActions } from "./useAuthActions.ts"

export function UserButton() {
	const user = useQuery(api.users.me)
	const { signOut } = useAuthActions()
	return (
		<Menu
			render={
				<Button appearance="clear" className="h-14">
					<span>{user?.name}</span>
					<Avatar src={user?.image} className="size-10" />
				</Button>
			}
			options={[
				{
					label: "Sign out",
					icon: <LogOut size={16} />,
					onClick: signOut,
				},
			]}
		/>
	)
}
