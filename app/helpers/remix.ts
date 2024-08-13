import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { Context, Effect, pipe } from "effect"
import { NoSuchElementException } from "effect/Cause"

class DataFunctionArgsService extends Context.Tag(
	"Remix:DataFunctionArgsService",
)<DataFunctionArgsService, LoaderFunctionArgs | ActionFunctionArgs>() {}

export function dataFunctionArgs() {
	return DataFunctionArgsService
}

export function dataFunctionFromEffect<Return>(
	effect: Effect.Effect<Return, unknown, DataFunctionArgsService>,
) {
	return function dataFunction(args: LoaderFunctionArgs) {
		return effect.pipe(
			Effect.provideService(DataFunctionArgsService, args),
			Effect.runPromise,
		)
	}
}

export const loaderFromEffect = dataFunctionFromEffect
export const actionFromEffect = dataFunctionFromEffect

export function dataFunctionParam(name: string) {
	return Effect.gen(function* () {
		const args = yield* DataFunctionArgsService
		return yield* pipe(
			Effect.fromNullable(args.params[name]),
			Effect.orElseFail(
				() => new NoSuchElementException(`param "${name}" not found`),
			),
		)
	})
}
