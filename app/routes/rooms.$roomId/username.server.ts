import { type TypedResponse, createCookie } from "@remix-run/node"

const usernameCookie = createCookie("username", {
	httpOnly: false,
	path: "/",
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax",
})

export async function setUsernameResponse<T>(
	username: string,
	response: TypedResponse<T> = new Response(),
) {
	response.headers.append(
		"Set-Cookie",
		await usernameCookie.serialize(username),
	)
	return response
}

export async function getUsername(request: Request) {
	return await usernameCookie.parse(request.headers.get("Cookie") ?? "")
}
