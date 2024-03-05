import type * as zod from "zod"

export function validateEnv<T>(
	schema: zod.ZodType<T, zod.ZodTypeDef, Record<string, string | undefined>>,
	env: Record<string, string | undefined>,
) {
	const result = schema.safeParse(env)
	if (!result.success) {
		const errors = result.error.errors.map(
			(error) => `\t- ${error.path.join(".")}: ${error.message}`,
		)
		throw new Error(`Environment validation failed:\n${errors.join("\n")}`)
	}
	return result.data
}
