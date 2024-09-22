import { Cause, Effect, Exit } from "effect"
import { InaccessibleError } from "./auth.ts"

export async function runConvexEffect<Result>(
	effect: Effect.Effect<Result, unknown>,
) {
	const exit = await Effect.runPromiseExit(effect)

	if (Exit.isSuccess(exit)) {
		return exit.value
	}

	if (Cause.isFailType(exit.cause)) {
		throw exit.cause.error
	}

	throw new Error("internal error", {
		cause: exit.cause,
	})
}

export function queryEntOrFail<Result>(
	construct: () => PromiseLike<Result | null>,
) {
	return Effect.promise(construct).pipe(
		Effect.filterOrFail(
			(result): result is NonNullable<Result> => result != null,
			() => new InaccessibleError({}),
		),
	)
}
