import { Outlet } from "@remix-run/react"
import { ProtectedLayout } from "../auth/protected-layout.tsx"

export default function ProtectedLayoutRoute() {
	return (
		<ProtectedLayout>
			<Outlet />
		</ProtectedLayout>
	)
}
