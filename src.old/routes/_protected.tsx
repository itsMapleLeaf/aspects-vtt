import { Outlet } from "@remix-run/react"
import { ProtectedLayout } from "../features/auth/ProtectedLayout.tsx"

export default function ProtectedLayoutRoute() {
	return (
		<ProtectedLayout>
			<Outlet />
		</ProtectedLayout>
	)
}
