import { literal, object, pipe, regex, union } from "valibot"
import { longText, shortText } from "~/lib/validators"

export const usernameValidator = pipe(
	shortText,
	regex(
		/^[a-z0-9\-_.]+$/i,
		"Can only include letters, numbers, periods (.), hypens (-), and underscores (_)",
	),
)

export const passwordValidator = longText

export const credentialsPayloadValidator = union([
	object({
		action: literal("login"),
		username: usernameValidator,
		password: passwordValidator,
	}),
	object({
		action: literal("register"),
		username: usernameValidator,
		password: passwordValidator,
	}),
])
