import { Effect } from "effect"

export const presentOrFail =
	<Error>(error: () => Error) =>
	<Value, CurrentError, Service>(
		self: Effect.Effect<Value | null | undefined, CurrentError, Service>,
	) =>
		Effect.filterOrFail(self, (value): value is Value => value != null, error)
