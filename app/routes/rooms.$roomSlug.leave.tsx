import { type ActionFunctionArgs, redirect } from "@remix-run/node"
import { updatePreferences } from "~/preferences.server.ts"

export async function action({ request }: ActionFunctionArgs) {
	return updatePreferences({ defaultRoomId: "" }, redirect("/", 303))
}
