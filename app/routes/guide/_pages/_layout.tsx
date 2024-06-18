import { Outlet } from "@remix-run/react"

export default function GuidePageLayout() {
	return (
		<div className="markdown rounded-lg bg-primary-200 p-4">
			<Outlet />
		</div>
	)
}
