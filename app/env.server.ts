import { z } from "zod"

const result = z
	.object({
		CONVEX_URL: z.string().url(),
	})
	.safeParse(process.env)

if (!result.success) {
	const errors = result.error.errors.map(
		(error) => `\t- ${error.path.join(".")}: ${error.message}`,
	)
	throw new Error(`Environment validation failed:\n${errors.join("\n")}`)
}

export const serverEnv = result.data
