import { redirect } from "@remix-run/node"
import type { ActionFunctionArgs } from "@remix-run/node"
import { useActionData } from "@remix-run/react"
import { ConvexHttpClient } from "convex/browser"
import { LucidePlus } from "lucide-react"
import { $path } from "remix-routes"
import { clientEnv } from "#app/env.ts"
import { Button } from "#app/ui/Button.tsx"
import { api } from "#convex/_generated/api.js"

export async function action({ request }: ActionFunctionArgs) {
	const convex = new ConvexHttpClient(clientEnv.VITE_CONVEX_URL)
	const result = await convex.mutation(api.rooms.create, {})
	return result.slug
		? redirect($path(`/rooms/:roomSlug/setup`, { roomSlug: result.slug }), 303)
		: result
}

export default function Index() {
	const actionData = useActionData<typeof action>()
	return (
		<form method="post" action="?index" className="p-4">
			<Button type="submit" text="Create new room" icon={<LucidePlus />} />
			{actionData && "error" in actionData && <p className="text-red-400">{actionData.error}</p>}
		</form>
	)
}
