import * as v from "valibot"
import { WEALTH_TIERS } from "~/features/characters/constants.ts"

export const shortText = v.pipe(
	v.string(),
	v.trim(),
	v.maxLength(100, "Must be 100 characters or less"),
)

export const nonEmptyShortText = v.pipe(
	shortText,
	v.nonEmpty("Cannot be empty"),
)

export const numericTextInput = v.pipe(
	v.string(),
	v.trim(),
	v.transform((input) => parseInt(input, 10)),
)

export const positiveInteger = v.pipe(
	v.number(),
	v.integer("Must be an integer (whole number)"),
	v.minValue(0, "Must be a positive number"),
)

export const positiveNumericTextInput = v.pipe(
	numericTextInput,
	positiveInteger,
)

export const longText = v.pipe(
	v.string(),
	v.trim(),
	v.maxLength(50_000, "Must be 50,000 characters or less"),
)

export const wealthTier = v.pipe(
	positiveInteger,
	v.maxValue(WEALTH_TIERS.length - 1, "Invalid wealth tier"),
)
