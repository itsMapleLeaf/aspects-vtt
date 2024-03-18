import { Outlet } from "@remix-run/react"

export default function AuthLayout() {
	return (
		<div className="mx-auto flex min-h-full max-w-screen-md flex-col">
			<div className="m-auto">
				<Outlet />
			</div>
		</div>
	)
}
