import { type ActionFunctionArgs, redirect } from "@remix-run/node"
import { getPreferences } from "~/preferences.server.ts"

export async function action({ request }: ActionFunctionArgs) {
	return (await getPreferences(request)).update({ defaultRoomId: undefined }, redirect("/", 303))
}
