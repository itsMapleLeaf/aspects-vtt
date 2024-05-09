import type { ObjectType, PropertyValidators } from "convex/values"
import { Context, Data, Effect, pipe } from "effect"
import { Iterator } from "iterator-helpers-polyfill"
import type { Awaitable, Overwrite } from "../../app/common/types.js"
import type { Id, TableNames } from "../_generated/dataModel.js"
import { mutation, query } from "./ents.js"
import type { MutationCtx, QueryCtx } from "./ents.js"

export class QueryCtxService extends Context.Tag("QueryCtxService")<QueryCtxService, QueryCtx>() {}

export class MutationCtxService extends Context.Tag("MutationCtxService")<
	MutationCtxService,
	MutationCtx
>() {}

export class ConvexInternalError extends Data.TaggedError("ConvexInternalError")<{
	cause: unknown
}> {}

export class ConvexDocNotFoundError extends Data.TaggedError("ConvexDocNotFoundError")<{
	id: string
}> {}

export function queryHandlerFromEffect<Args extends unknown[], Data>(
	createEffect: (...args: Args) => Effect.Effect<Data, unknown, QueryCtxService>,
) {
	return function handler(ctx: QueryCtx, ...args: Args) {
		return createEffect(...args).pipe(
			Effect.provideService(QueryCtxService, ctx),
			Effect.runPromise,
		)
	}
}

export function mutationHandlerFromEffect<Args extends unknown[], Data>(
	createEffect: (
		...args: Args
	) => Effect.Effect<Data, unknown, QueryCtxService | MutationCtxService>,
) {
	return function handler(ctx: MutationCtx, ...args: Args) {
		return createEffect(...args).pipe(
			Effect.provideService(MutationCtxService, ctx),
			Effect.provideService(QueryCtxService, ctx),
			Effect.runPromise,
		)
	}
}

export function effectQuery<Args extends PropertyValidators, Output>(options: {
	args: Args
	handler: (
		// biome-ignore lint/complexity/noBannedTypes: hack to satisfy the handler args type
		args: Overwrite<ObjectType<Args>, {}>,
	) => Effect.Effect<Output, unknown, QueryCtxService>
}) {
	return query({
		args: options.args,
		handler: (ctx, args) => {
			return Effect.runPromise(
				pipe(options.handler(args), Effect.provideService(QueryCtxService, ctx)),
			)
		},
	})
}

export function effectMutation<Args extends PropertyValidators, Output>(options: {
	args: Args
	handler: (
		// biome-ignore lint/complexity/noBannedTypes: hack to satisfy the handler args type
		args: Overwrite<ObjectType<Args>, {}>,
	) => Effect.Effect<Output, unknown, QueryCtxService | MutationCtxService>
}) {
	return mutation({
		...options,
		handler(ctx, args) {
			return Effect.runPromise(
				pipe(
					options.handler(args),
					Effect.provideService(QueryCtxService, ctx),
					Effect.provideService(MutationCtxService, ctx),
				),
			)
		},
	})
}

export function getDoc<TableName extends TableNames>(id: Id<TableName>) {
	return Effect.gen(function* () {
		const ctx = yield* QueryCtxService
		const doc = yield* Effect.tryPromise({
			try: () => ctx.db.get(id),
			catch: (cause) => new ConvexInternalError({ cause }),
		})
		return yield* Effect.mapError(
			Effect.fromNullable(doc),
			() => new ConvexDocNotFoundError({ id }),
		)
	})
}

export function getDocs<TableName extends TableNames>(ids: Iterable<Id<TableName>>) {
	return Effect.all(Iterator.from(ids).map(getDoc))
}

export function withQueryCtx<Result>(callback: (context: QueryCtx) => Awaitable<Result>) {
	return Effect.gen(function* () {
		const ctx = yield* QueryCtxService
		return yield* Effect.tryPromise(async () => await callback(ctx))
	})
}
