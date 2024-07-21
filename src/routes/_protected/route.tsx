import { Outlet } from "@remix-run/react"
import { useConvexAuth, useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api.js"
import { LoadingCover } from "../../ui/loading.tsx"
import { AuthForm } from "./auth-form.tsx"

export default function ProtectedLayout() {
	const user = useQuery(api.users.me)
	const auth = useConvexAuth()
	const loading = user === undefined || auth.isLoading
	return (
		<>
			{loading ? null : user === null ? <AuthForm /> : <Outlet />}
			<LoadingCover visible={loading} />
		</>
	)
}
