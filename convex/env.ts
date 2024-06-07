import * as z from "zod"

export function convexEnv() {
	const result = z
		.object({
			CLERK_JWT_ISSUER_DOMAIN: z.string().url(),
			NOTION_API_SECRET: z.string(),
			NOTION_ATTRIBUTES_DATABASE_ID: z.string(),
			NOTION_GENERAL_SKILLS_DATABASE_ID: z.string(),
			NOTION_RACES_DATABASE_ID: z.string(),
			// NOTION_ASPECT_SKILLS_DATABASE_ID: z.string(),
			NOTION_ASPECTS_DATABASE_ID: z.string(),
		})
		.safeParse(process.env)

	if (!result.success) {
		const issues = result.error.issues.map((i) => `- ${i.path}: ${i.message}`)
		throw new Error(`Missing environment variables:\n${issues.join("\n")}`)
	}
	return result.data
}
