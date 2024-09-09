import { ConvexError } from "convex/values"
import { Effect } from "effect"
import { AppError } from "../../common/AppError.ts"

export function handleMutationError<T, E, S>(effect: Effect.Effect<T, E, S>) {
	return Effect.catchAll(effect, (error) => {
		if (error instanceof AppError) {
			return Effect.die(new ConvexError(error.userMessage))
		}
		return Effect.die(new ConvexError(`Something went wrong. Try again.`))
	})
}
