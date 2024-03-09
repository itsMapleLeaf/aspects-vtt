import { type TypedResponse, createCookie } from "@remix-run/node"
import { z } from "zod"

const preferencesSchema = z
	.object({
		username: z.string(),
		defaultRoomId: z.string(),
	})
	.partial()
export type PreferencesData = z.output<typeof preferencesSchema>

const preferencesCookie = createCookie("preferences", {
	path: "/",
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax",
})

export async function getPreferences(request: Request): Promise<PreferencesData> {
	const result = preferencesSchema.safeParse(
		await preferencesCookie.parse(request.headers.get("cookie")),
	)
	return result.success ? result.data : {}
}

export async function updatePreferences<T>(
	preferences: Partial<PreferencesData>,
	response: TypedResponse<T> = new Response(),
): Promise<TypedResponse<T>> {
	response.headers.append("Set-Cookie", await preferencesCookie.serialize(preferences))
	return response
}
