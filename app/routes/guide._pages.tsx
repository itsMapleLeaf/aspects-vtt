import { Outlet } from "@remix-run/react"

export default function GuidePageLayout() {
	return (
		<div className="markdown relative rounded-lg bg-primary-200 p-4 shadow-md">
			<Outlet />
		</div>
	)
}
