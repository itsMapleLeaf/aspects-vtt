import { ConvexError } from "convex/values"
import { Data, Effect } from "effect"

export class AppError extends Data.TaggedError("AppError")<{
	message: string
}> {}

export function handleMutationError<T, E, S>(effect: Effect.Effect<T, E, S>) {
	return Effect.catchAll(effect, (error) => {
		if (error instanceof AppError) {
			return Effect.die(new ConvexError(error.message))
		}
		return Effect.die(new ConvexError(`Something went wrong. Try again.`))
	})
}
