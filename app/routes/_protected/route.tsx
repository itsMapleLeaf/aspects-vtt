import { Outlet } from "@remix-run/react"
import { ProtectedLayout } from "./ProtectedLayout.tsx"

export default function ProtectedRoute() {
	return (
		<ProtectedLayout>
			<Outlet />
		</ProtectedLayout>
	)
}
