import { redirect } from "@remix-run/node"
import type { ActionFunctionArgs } from "@remix-run/node"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { api } from "convex-backend/_generated/api.js"
import { ConvexHttpClient } from "convex/browser"
import { LuPlus } from "react-icons/lu"
import { serverEnv } from "~/env.server.js"
import { getDefaultRoomId } from "~/features/rooms/defaultRoom.server"
import { Button } from "~/ui/Button"

export async function loader({ request }: LoaderFunctionArgs) {
	const roomId = await getDefaultRoomId(request)
	return roomId ? redirect(`/rooms/${roomId}`, 303) : null
}

export async function action({ request }: ActionFunctionArgs) {
	const convex = new ConvexHttpClient(serverEnv.CONVEX_URL)
	const result = await convex.mutation(api.rooms.create, {})
	return redirect(`/rooms/${result.slug}`, 303)
}

export default function Index() {
	return (
		<form method="post" action="?index" className="p-4">
			<Button type="submit" text="Create new room" icon={<LuPlus />} />
		</form>
	)
}
