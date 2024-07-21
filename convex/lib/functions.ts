import { ArgsArrayForOptionalValidator } from "convex/server"
import { PropertyValidators, Value } from "convex/values"
import { Effect, pipe } from "effect"
import {
	action,
	internalAction,
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "../_generated/server.js"
import {
	ActionContextService,
	MutationContextService,
	QueryContextService,
} from "./context.ts"

export function effectQuery<
	Args extends PropertyValidators | undefined | void,
	ArgsArray extends ArgsArrayForOptionalValidator<Args>,
	Output,
	Error,
>(options: {
	args?: Args
	handler: (
		...args: ArgsArray
	) => Effect.Effect<Output, never, QueryContextService>
}) {
	return query({
		args: options.args,
		handler(ctx, ...args: ArgsArray) {
			return pipe(
				options.handler(...args),
				Effect.provideService(QueryContextService, ctx),
				Effect.runPromise,
			)
		},
	})
}

export function internalEffectQuery<
	Args extends PropertyValidators | undefined | void,
	ArgsArray extends ArgsArrayForOptionalValidator<Args>,
	Output,
>(options: {
	args?: Args
	handler: (
		...args: ArgsArray
	) => Effect.Effect<Output, never, QueryContextService>
}) {
	return internalQuery({
		args: options.args,
		handler(ctx, ...args: ArgsArray) {
			return pipe(
				options.handler(...args),
				Effect.provideService(QueryContextService, ctx),
				Effect.runPromise,
			)
		},
	})
}

export function effectMutation<
	Args extends PropertyValidators | undefined | void,
	ArgsArray extends ArgsArrayForOptionalValidator<Args>,
	Output extends Value | void,
>(options: {
	args?: Args
	handler: (
		...args: ArgsArray
	) => Effect.Effect<
		Output,
		unknown,
		MutationContextService | QueryContextService
	>
}) {
	return mutation({
		args: options.args,
		handler(ctx, ...args: ArgsArray) {
			return pipe(
				options.handler(...args),
				Effect.provideService(QueryContextService, ctx),
				Effect.provideService(MutationContextService, ctx),
				Effect.orDie,
				Effect.runPromise,
			)
		},
	})
}

export function internalEffectMutation<
	Args extends PropertyValidators | undefined | void,
	ArgsArray extends ArgsArrayForOptionalValidator<Args>,
	Output,
>(options: {
	args?: Args
	handler: (
		...args: ArgsArray
	) => Effect.Effect<
		Output,
		unknown,
		MutationContextService | QueryContextService
	>
}) {
	return internalMutation({
		args: options.args,
		handler(ctx, ...args: ArgsArray) {
			return pipe(
				options.handler(...args),
				Effect.provideService(QueryContextService, ctx),
				Effect.provideService(MutationContextService, ctx),
				Effect.orDie,
				Effect.runPromise,
			)
		},
	})
}

export function effectAction<
	Args extends PropertyValidators | undefined | void,
	ArgsArray extends ArgsArrayForOptionalValidator<Args>,
	Output,
>(options: {
	args?: Args
	handler: (
		...args: ArgsArray
	) => Effect.Effect<Output, unknown, ActionContextService>
}) {
	return action({
		args: options.args,
		handler(ctx, ...args: ArgsArray) {
			return pipe(
				options.handler(...args),
				Effect.provideService(ActionContextService, ctx),
				Effect.orDie,
				Effect.runPromise,
			)
		},
	})
}

export function internalEffectAction<
	Args extends PropertyValidators | undefined | void,
	ArgsArray extends ArgsArrayForOptionalValidator<Args>,
	Output,
>(options: {
	args?: Args
	handler: (
		...args: ArgsArray
	) => Effect.Effect<Output, unknown, ActionContextService>
}) {
	return internalAction({
		args: options.args,
		handler(ctx, ...args: ArgsArray) {
			return pipe(
				options.handler(...args),
				Effect.provideService(ActionContextService, ctx),
				Effect.orDie,
				Effect.runPromise,
			)
		},
	})
}
