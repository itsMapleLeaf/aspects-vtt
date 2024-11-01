import * as v from "valibot"
import { WEALTH_TIERS } from "~/features/characters/wealth"
import { positiveInteger } from "~/lib/validators"

export const wealthTier = v.pipe(
	positiveInteger,
	v.maxValue(WEALTH_TIERS.length - 1, "Invalid wealth tier"),
)
