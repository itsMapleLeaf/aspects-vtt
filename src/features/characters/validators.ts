import * as v from "valibot"
import { positiveInteger } from "~/common/validators"
import { WEALTH_TIERS } from "~/features/characters/constants.ts"

export const wealthTier = v.pipe(
	positiveInteger,
	v.maxValue(WEALTH_TIERS.length - 1, "Invalid wealth tier"),
)
