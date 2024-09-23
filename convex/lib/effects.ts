import type { ArgsArrayForOptionalValidator } from "convex/server"
import type { PropertyValidators } from "convex/values"
import { Cause, Context, Effect, Exit, pipe } from "effect"
import { InaccessibleError } from "../auth.ts"
import {
	internalQuery,
	mutation,
	query,
	type Ent,
	type EntMutationCtx,
	type EntQueryCtx,
	type EntTableNames,
} from "./ents.ts"

export async function runConvexEffect<Result>(effect: Effect.Effect<Result>) {
	const exit = await Effect.runPromiseExit(effect)

	if (Exit.isSuccess(exit)) {
		return exit.value
	}

	if (Cause.isDieType(exit.cause)) {
		throw exit.cause.defect
	}

	throw new Error("internal error", {
		cause: exit.cause,
	})
}

class QueryCtxService extends Context.Tag("QueryCtxService")<
	QueryCtxService,
	EntQueryCtx
>() {}

class MutationCtxService extends Context.Tag("MutationCtxService")<
	MutationCtxService,
	EntMutationCtx
>() {}

export function getQueryCtx() {
	return QueryCtxService
}

export function getMutationCtx() {
	return MutationCtxService
}

export function effectQuery<
	Result,
	ArgsArray extends ArgsArrayForOptionalValidator<Args>,
	Args extends PropertyValidators | void = void,
>(options: {
	args?: Args
	handler: (
		ctx: EntQueryCtx,
		...args: ArgsArray
	) => Effect.Effect<Result, never, QueryCtxService>
}) {
	return query({
		args: options.args,
		handler: (ctx, ...args: ArgsArray) =>
			pipe(
				options.handler(ctx, ...args),
				Effect.provideService(QueryCtxService, ctx),
				runConvexEffect,
			),
	})
}

export function internalEffectQuery<
	Result,
	ArgsArray extends ArgsArrayForOptionalValidator<Args>,
	Args extends PropertyValidators | void = void,
>(options: {
	args?: Args
	handler: (
		ctx: EntQueryCtx,
		...args: ArgsArray
	) => Effect.Effect<Result, never, QueryCtxService>
}) {
	return internalQuery({
		args: options.args,
		handler: (ctx, ...args: ArgsArray) =>
			pipe(
				options.handler(ctx, ...args),
				Effect.provideService(QueryCtxService, ctx),
				runConvexEffect,
			),
	})
}

export function effectMutation<
	Result,
	ArgsArray extends ArgsArrayForOptionalValidator<Args>,
	Args extends PropertyValidators | void = void,
>(options: {
	args?: Args
	handler: (
		ctx: EntMutationCtx,
		...args: ArgsArray
	) => Effect.Effect<Result, never, MutationCtxService | QueryCtxService>
}) {
	return mutation({
		args: options.args,
		handler: (ctx, ...args: ArgsArray) =>
			pipe(
				options.handler(ctx, ...args),
				Effect.provideService(QueryCtxService, ctx),
				Effect.provideService(MutationCtxService, ctx),
				runConvexEffect,
			),
	})
}

export function internalEffectMutation<
	Result,
	ArgsArray extends ArgsArrayForOptionalValidator<Args>,
	Args extends PropertyValidators | void = void,
>(options: {
	args?: Args
	handler: (
		ctx: EntMutationCtx,
		...args: ArgsArray
	) => Effect.Effect<Result, never, MutationCtxService | QueryCtxService>
}) {
	return mutation({
		args: options.args,
		handler: (ctx, ...args: ArgsArray) =>
			pipe(
				options.handler(ctx, ...args),
				Effect.provideService(QueryCtxService, ctx),
				Effect.provideService(MutationCtxService, ctx),
				runConvexEffect,
			),
	})
}

export function queryEnt<EntType extends Ent<EntTableNames>>(
	query: PromiseLike<EntType | null>,
) {
	return Effect.filterOrFail(
		Effect.promise(() => query),
		(ent) => ent != null,
		() => new InaccessibleError({}),
	)
}
