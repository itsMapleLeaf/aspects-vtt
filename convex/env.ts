import * as z from "zod"

export function convexEnv() {
	const result = z
		.object({
			CLERK_JWT_ISSUER_DOMAIN: z.string().url(),
			CLERK_WEBHOOK_SECRET: z.string(),
			CLERK_SECRET_KEY: z.string(),
		})
		.safeParse(process.env)

	if (!result.success) {
		const issues = result.error.issues.map((i) => `- ${i.path.join(".")}: ${i.message}`)
		throw new Error(`Missing environment variables:\n${issues.join("\n")}`)
	}
	return result.data
}
