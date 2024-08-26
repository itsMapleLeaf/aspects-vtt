import { Outlet } from "@remix-run/react"
import { ProtectedLayout } from "../components/ProtectedLayout.tsx"

export default function ProtectedLayoutRoute() {
	return (
		<ProtectedLayout>
			<Outlet />
		</ProtectedLayout>
	)
}
