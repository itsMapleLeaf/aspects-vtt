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

export class Preferences {
	#data

	constructor(data: Readonly<PreferencesData>) {
		this.#data = data
	}

	static async fromRequest(request: Request) {
		const result = preferencesSchema.safeParse(
			await preferencesCookie.parse(request.headers.get("cookie")),
		)
		return new Preferences(result.success ? result.data : {})
	}

	get username() {
		return this.#data.username
	}

	get defaultRoomId() {
		return this.#data.defaultRoomId
	}

	update(data: Partial<PreferencesData>) {
		this.#data = { ...this.#data, ...data }
	}

	async response<T>(response: TypedResponse<T> = new Response()) {
		response.headers.append("Set-Cookie", await preferencesCookie.serialize(this.#data))
		return response
	}
}
