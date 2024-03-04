import { type TypedResponse, createCookie } from "@remix-run/node"

const defaultRoomCookie = createCookie("defaultRoom", {
	httpOnly: false,
	path: "/",
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax",
})

export async function setDefaultRoomResponse<T>(
	roomId: string,
	response: TypedResponse<T> = new Response(),
) {
	response.headers.append("Set-Cookie", await defaultRoomCookie.serialize(roomId))
	return response
}

export async function getDefaultRoomId(request: Request) {
	const value = await defaultRoomCookie.parse(request.headers.get("Cookie") ?? "")
	return (typeof value === "string" && value) || undefined
}
