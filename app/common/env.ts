import type * as zod from "zod"

export function validateEnv<Output, Input>(
	schema: zod.ZodType<Output, zod.ZodTypeDef, Input>,
	env: Input,
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
