import { Outlet } from "@remix-run/react"

export default function AuthLayout() {
	return (
		<div className="mx-auto w-full max-w-sm p-16">
			<Outlet />
		</div>
	)
}
