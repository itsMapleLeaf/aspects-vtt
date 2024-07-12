import { ArgsArrayForOptionalValidator } from "convex/server"
import { PropertyValidators } from "convex/values"
import { Context, Effect, pipe } from "effect"
import { MaybeFunction } from "../../lib/types.ts"

const _FunctionContextService = Symbol()
type FunctionContextService<Ctx> = typeof _FunctionContextService & { ctx: Ctx }

export function FunctionContextService<Ctx>() {
	return Context.GenericTag<FunctionContextService<Ctx>, Ctx>(
		"FunctionContextService",
	)
}

export function endpoint<
	Ctx,
	Result,
	Func,
	ArgsArray extends ArgsArrayForOptionalValidator<Args>,
	Args extends PropertyValidators | void = {},
>(
	build: (options: {
		args?: Args
		handler: (ctx: Ctx, ...args: ArgsArray) => Promise<Result>
	}) => Func,
	options: {
		args?: Args
		handler: MaybeFunction<
			ArgsArray,
			Effect.Effect<Result, never, FunctionContextService<Ctx>>
		>
	},
) {
	return build({
		args: options.args,
		handler(ctx, ...args) {
			return pipe(
				typeof options.handler === "function"
					? options.handler(...args)
					: options.handler,
				Effect.provideService(FunctionContextService<Ctx>(), ctx),
				Effect.runPromise,
			)
		},
	})
}
