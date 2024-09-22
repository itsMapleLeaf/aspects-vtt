import { useQuery } from "convex/react"
import { LogOut } from "lucide-react"
import { Avatar } from "~/components/Avatar.tsx"
import { Menu } from "~/components/Menu.tsx"
import { api } from "~/convex/_generated/api.js"
import { useAuthActions } from "./useAuthActions.ts"

export function UserButton() {
	const user = useQuery(api.users.me)
	const { signOut } = useAuthActions()
	return (
		<Menu
			render={<Avatar src={user?.image} className="size-10" />}
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
