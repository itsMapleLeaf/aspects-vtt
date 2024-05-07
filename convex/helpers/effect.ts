import type { ValidatedFunction } from "convex/server"
import type { ObjectType, PropertyValidators } from "convex/values"
import { Context, Effect, pipe } from "effect"
import type { Id, TableNames } from "../_generated/dataModel.js"
import type { MutationCtx, QueryCtx } from "../_generated/server.js"
import { mutation, query } from "../_generated/server.js"

export class QueryCtxService extends Context.Tag("QueryCtxService")<QueryCtxService, QueryCtx>() {}

export class MutationCtxService extends Context.Tag("MutationCtxService")<
	MutationCtxService,
	MutationCtx
>() {}

export function effectQuery<Args extends PropertyValidators, Output>(options: {
	args: Args
	handler: (args: ObjectType<Args>) => Effect.Effect<Output, never, QueryCtxService>
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

export function effectMutation<
	Options extends ValidatedFunction<
		MutationCtx,
		PropertyValidators,
		Effect.Effect<unknown, never, MutationCtxService>
	>,
>(options: Options) {
	return mutation({
		...options,
		handler(ctx, args) {
			return Effect.runPromise(
				pipe(options.handler(ctx, args), Effect.provideService(MutationCtxService, ctx)),
			)
		},
	})
}

export function getDoc<TableName extends TableNames>(id: Id<TableName>) {
	return Effect.gen(function* () {
		const ctx = yield* QueryCtxService
		const doc = yield* Effect.tryPromise(() => ctx.db.get(id))
		return yield* Effect.fromNullable(doc)
	})
}
