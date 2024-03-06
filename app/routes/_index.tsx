import { redirect } from "@remix-run/node"
import type { ActionFunctionArgs } from "@remix-run/node"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { api } from "convex-backend/_generated/api.js"
import { ConvexHttpClient } from "convex/browser"
import { LucidePlus } from "lucide-react"

import { clientEnv } from "~/env.ts"
import { Preferences } from "~/preferences.server.ts"
import { Button } from "~/ui/Button"

export async function loader({ request }: LoaderFunctionArgs) {
	const preferences = await Preferences.fromRequest(request)
	return preferences.defaultRoomId
		? redirect(`/rooms/${preferences.defaultRoomId}`, 303)
		: null
}

export async function action({ request }: ActionFunctionArgs) {
	const convex = new ConvexHttpClient(clientEnv.VITE_CONVEX_URL)
	const result = await convex.mutation(api.rooms.create, {})
	return redirect(`/rooms/${result.slug}`, 303)
}

export default function Index() {
	return (
		<form method="post" action="?index" className="p-4">
			<Button type="submit" text="Create new room" icon={<LucidePlus />} />
		</form>
	)
}
