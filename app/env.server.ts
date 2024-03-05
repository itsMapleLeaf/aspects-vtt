import { z } from "zod"
import { validateEnv } from "./common/env.ts"

export const serverEnv = validateEnv(
	z.object({
		// placeholder
	}),
	process.env,
)
