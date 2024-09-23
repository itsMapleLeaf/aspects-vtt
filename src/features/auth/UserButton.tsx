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
			render={
				<button
					type="button"
					className="flex items-center rounded-md bg-primary-100 bg-opacity-0 px-3 py-2 transition gap-2 hover:bg-opacity-10 active:bg-opacity-20 active:duration-0"
				>
					<span>{user?.name}</span>
					<Avatar src={user?.image} className="size-10" />
				</button>
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
