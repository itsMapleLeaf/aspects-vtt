import type { DocumentByName, WithoutSystemFields } from "convex/server"
import type { ObjectType, PropertyValidators } from "convex/values"
import { Context, Data, Effect, pipe } from "effect"
import { Iterator } from "iterator-helpers-polyfill"
import type { Awaitable, Overwrite } from "../../app/common/types.js"
import type { DataModel, Doc, Id, TableNames } from "../_generated/dataModel.js"
import type { MutationCtx, QueryCtx } from "./ents.js"
import { mutation, query } from "./ents.js"

export class QueryCtxService extends Context.Tag("QueryCtxService")<QueryCtxService, QueryCtx>() {}

export class MutationCtxService extends Context.Tag("MutationCtxService")<
	MutationCtxService,
	MutationCtx
>() {}

export class ConvexInternalError extends Data.TaggedError("ConvexInternalError")<{
	cause: unknown
}> {}

export class ConvexDocNotFoundError extends Data.TaggedError("ConvexDocNotFoundError")<{
	id?: string
	table?: string
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
		// hack to satisfy the handler args type
		// eslint-disable-next-line @typescript-eslint/ban-types
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
		// hack to satisfy the handler args type
		// eslint-disable-next-line @typescript-eslint/ban-types
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

export function withQueryCtx<Result>(callback: (context: QueryCtx) => PromiseLike<Result>) {
	return QueryCtxService.pipe(
		Effect.flatMap((ctx) => Effect.tryPromise(() => callback(ctx))),
		Effect.catchAllCause((cause) => new ConvexInternalError({ cause })),
	)
}

export function withQueryCtxSync<Result>(callback: (context: QueryCtx) => Result) {
	return QueryCtxService.pipe(
		Effect.flatMap((ctx) => Effect.try(() => callback(ctx))),
		Effect.catchAllCause((cause) => new ConvexInternalError({ cause })),
	)
}

export function withMutationCtx<Result>(callback: (context: MutationCtx) => Awaitable<Result>) {
	return MutationCtxService.pipe(
		Effect.flatMap((ctx) => Effect.tryPromise(async () => await callback(ctx))),
		Effect.catchAllCause((cause) => new ConvexInternalError({ cause })),
	)
}

export function withMutationCtxSync<Result>(callback: (context: MutationCtx) => Result) {
	return MutationCtxService.pipe(
		Effect.flatMap((ctx) => Effect.try(() => callback(ctx))),
		Effect.catchAllCause((cause) => new ConvexInternalError({ cause })),
	)
}
export function queryDoc<D extends Doc<TableNames>>(
	callback: (context: QueryCtx) => Promise<D | null>,
) {
	return withQueryCtx(callback).pipe(Effect.flatMap(ensureDoc))
}

export function ensureDoc<D extends Doc<TableNames>>(doc: D | undefined | null) {
	return doc != null ? Effect.succeed(doc) : Effect.fail(new ConvexDocNotFoundError({}))
}

export function getEntityDoc<T extends TableNames>(table: T, id: Id<T>) {
	return queryDoc((ctx) => ctx.table(table).get(id).doc())
}

export function insertDoc<T extends TableNames>(table: T, data: WithoutSystemFields<Doc<T>>) {
	return withMutationCtx((ctx) => ctx.db.insert(table, data))
}

export function updateDoc<Name extends TableNames>(
	id: Id<Name>,
	data: Partial<DocumentByName<DataModel, Name>>,
) {
	return withMutationCtx((ctx) => ctx.db.patch(id, data))
}
