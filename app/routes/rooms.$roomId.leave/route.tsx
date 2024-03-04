import { type ActionFunctionArgs, redirect } from "@remix-run/node"
import { setDefaultRoomResponse } from "~/features/rooms/defaultRoom.server.ts"

export async function action({ request }: ActionFunctionArgs) {
	return setDefaultRoomResponse("", redirect("/", 303))
}
