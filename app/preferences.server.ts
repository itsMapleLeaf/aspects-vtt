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

export async function getPreferences(request: Request) {
	const result = preferencesSchema.safeParse(
		await preferencesCookie.parse(request.headers.get("cookie")),
	)
	const data = result.success ? result.data : {}
	return {
		...data,
		async update<T>(
			updates: Partial<PreferencesData>,
			response: TypedResponse<T>,
		): Promise<TypedResponse<T>> {
			response.headers.append(
				"Set-Cookie",
				await preferencesCookie.serialize({ ...data, ...updates }),
			)
			return response
		},
	}
}
