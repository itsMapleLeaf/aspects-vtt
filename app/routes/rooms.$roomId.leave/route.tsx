import { type ActionFunctionArgs, redirect } from "@remix-run/node"
import { Preferences } from "~/preferences.server.ts"

export async function action({ request }: ActionFunctionArgs) {
	const preferences = await Preferences.fromRequest(request)
	preferences.update({ defaultRoomId: "" })
	return preferences.response(redirect("/", 303))
}
