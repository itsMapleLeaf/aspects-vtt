import { useAuthActions } from "@convex-dev/auth/react"
import { LucideLogOut } from "lucide-react"
import { ApiImage } from "~/modules/api-images/ApiImage.tsx"
import { useUser } from "~/modules/auth/hooks.ts"
import { Loading } from "./Loading.tsx"
import { Menu, MenuButton, MenuItem, MenuPanel } from "./Menu.tsx"

export function UserButton() {
	const user = useUser()
	const actions = useAuthActions()
	return (
		user === undefined ? <Loading />
		: user === null ? null
		: <Menu placement="bottom">
				<MenuButton className="size-8">
					<ApiImage
						imageId={user?.image}
						className="overflow-clip rounded-full transition-transform hover:scale-110 active:scale-100 active:duration-0"
					/>
				</MenuButton>
				<MenuPanel>
					<form action={actions.signOut}>
						<MenuItem type="submit" icon={<LucideLogOut />}>
							Sign out
						</MenuItem>
					</form>
				</MenuPanel>
			</Menu>
	)
}
