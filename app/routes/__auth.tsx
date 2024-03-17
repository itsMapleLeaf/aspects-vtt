import { Outlet } from "@remix-run/react"

export default function AuthLayout() {
	return (
		<div className="mx-auto p-8">
			<Outlet />
		</div>
	)
}
