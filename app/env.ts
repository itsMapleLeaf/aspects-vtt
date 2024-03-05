import { z } from "zod"
import { validateEnv } from "./common/env.ts"

export const clientEnv = validateEnv(
	z.object({
		VITE_CONVEX_URL: z.string().url(),
	}),
	{
		VITE_CONVEX_URL: import.meta.env.VITE_CONVEX_URL,
	},
)
