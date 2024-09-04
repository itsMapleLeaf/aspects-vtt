import { ConvexError } from "convex/values"
import { Effect } from "effect"
import { AppError } from "../../src/lib/AppError"

// Remove the AppError class definition as it's now imported from src/lib/errors.ts

export function handleMutationError<T, E, S>(effect: Effect.Effect<T, E, S>) {
	return Effect.catchAll(effect, (error) => {
		if (error instanceof AppError) {
			return Effect.die(new ConvexError(error.userMessage))
		}
		return Effect.die(new ConvexError(`Something went wrong. Try again.`))
	})
}
