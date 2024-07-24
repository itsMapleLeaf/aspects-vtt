import type {
	ArgsArrayForOptionalValidator,
	DocumentByInfo,
	DocumentByName,
	ExpressionOrValue,
	FilterBuilder,
	GenericActionCtx,
	GenericDataModel,
	GenericTableInfo,
	IndexNames,
	IndexRange,
	IndexRangeBuilder,
	NamedIndex,
	OrderedQuery,
	PaginationOptions,
	Query,
	QueryInitializer,
	SystemTableNames,
	WithoutSystemFields,
} from "convex/server"
import type { PropertyValidators } from "convex/values"
import { Context, Data, Effect, pipe } from "effect"
import { isNonNil } from "~/helpers/validation.js"
import type { Awaitable, Nullish } from "../../app/helpers/types.js"
import type { DataModel, Id, TableNames } from "../_generated/dataModel.js"
import type { MutationCtx, QueryCtx } from "../_generated/server.js"
import {
	action,
	internalAction,
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "../_generated/server.js"

export class QueryCtxService extends Context.Tag("QueryCtxService")<QueryCtxService, QueryCtx>() {}

export class MutationCtxService extends Context.Tag("MutationCtxService")<
	MutationCtxService,
	MutationCtx
>() {}

export class ActionCtxService extends Context.Tag("ActionCtxService")<
	ActionCtxService,
	GenericActionCtx<GenericDataModel>
>() {}

export class ConvexDocNotFoundError extends Data.TaggedError("ConvexDocNotFoundError")<{
	id?: string
	table?: string
}> {}

export class NotLoggedInError extends Data.TaggedError("NotLoggedInError")<{}> {}

export class FileNotFoundError extends Data.TaggedError("FileNotFoundError")<{}> {}

export class InvalidIdError<T extends string> extends Data.TaggedError("InvalidIdError")<{
	table: T
	id: string
}> {}

interface EffectBuilderOptions<
	Args extends PropertyValidators | void,
	ArgsArray extends ArgsArrayForOptionalValidator<Args>,
	Output,
	Service,
> {
	args?: Args
	handler: (...args: ArgsArray) => Effect.Effect<Output, unknown, Service>
}

export function effectQuery<
	Args extends PropertyValidators | void,
	ArgsArray extends ArgsArrayForOptionalValidator<Args>,
	Output,
>(options: EffectBuilderOptions<Args, ArgsArray, Output, QueryCtxService>) {
	return query({
		args: options.args,
		handler(ctx, ...args: ArgsArray) {
			return pipe(
				options.handler(...args),
				Effect.provideService(QueryCtxService, ctx),
				Effect.runPromise,
			)
		},
	})
}

export function effectMutation<
	Args extends PropertyValidators,
	ArgsArray extends ArgsArrayForOptionalValidator<Args>,
	Output,
>(options: EffectBuilderOptions<Args, ArgsArray, Output, QueryCtxService | MutationCtxService>) {
	return mutation({
		...options,
		handler(ctx, ...args: ArgsArray) {
			return pipe(
				options.handler(...args),
				Effect.provideService(QueryCtxService, ctx),
				Effect.provideService(MutationCtxService, ctx),
				Effect.runPromise,
			)
		},
	})
}

export function effectAction<
	Args extends PropertyValidators,
	ArgsArray extends ArgsArrayForOptionalValidator<Args>,
	Output,
>(options: EffectBuilderOptions<Args, ArgsArray, Output, ActionCtxService>) {
	return action({
		...options,
		handler(ctx, ...args: ArgsArray) {
			return pipe(
				options.handler(...args),
				Effect.provideService(
					ActionCtxService,
					ctx as unknown as GenericActionCtx<GenericDataModel>,
				),
				Effect.runPromise,
			)
		},
	})
}

export function internalEffectQuery<
	Args extends PropertyValidators,
	ArgsArray extends ArgsArrayForOptionalValidator<Args>,
	Output,
>(options: EffectBuilderOptions<Args, ArgsArray, Output, QueryCtxService>) {
	return internalQuery({
		...options,
		handler(ctx, ...args: ArgsArray) {
			return pipe(
				options.handler(...args),
				Effect.provideService(QueryCtxService, ctx),
				Effect.runPromise,
			)
		},
	})
}

export function internalEffectMutation<
	Args extends PropertyValidators,
	ArgsArray extends ArgsArrayForOptionalValidator<Args>,
	Output,
>(options: EffectBuilderOptions<Args, ArgsArray, Output, QueryCtxService | MutationCtxService>) {
	return internalMutation({
		...options,
		handler(ctx, ...args: ArgsArray) {
			return pipe(
				options.handler(...args),
				Effect.provideService(QueryCtxService, ctx),
				Effect.provideService(MutationCtxService, ctx),
				Effect.runPromise,
			)
		},
	})
}

export function internalEffectAction<
	Args extends PropertyValidators,
	ArgsArray extends ArgsArrayForOptionalValidator<Args>,
	Output,
>(options: EffectBuilderOptions<Args, ArgsArray, Output, ActionCtxService>) {
	return internalAction({
		...options,
		handler(ctx, ...args: ArgsArray) {
			return pipe(
				options.handler(...args),
				Effect.provideService(
					ActionCtxService,
					ctx as unknown as GenericActionCtx<GenericDataModel>,
				),
				Effect.runPromise,
			)
		},
	})
}

export function docOrFail<D>(doc: D | undefined | null) {
	return doc != null ? Effect.succeed(doc) : Effect.fail(new ConvexDocNotFoundError({}))
}

class ConvexEffectDb {
	readonly system = new ConvexEffectSystemDb()

	get<T extends TableNames>(id: Id<T>) {
		return QueryCtxService.pipe(
			Effect.flatMap((ctx) => Effect.promise(() => ctx.db.get(id))),
			Effect.flatMap(docOrFail),
		)
	}

	query<T extends TableNames>(table: T) {
		return new EffectQueryInitializer(
			QueryCtxService.pipe(Effect.map((ctx) => ctx.db.query(table))),
		)
	}

	normalizeId<T extends TableNames>(table: T, id: string) {
		return QueryCtxService.pipe(
			Effect.map((ctx) => ctx.db.normalizeId(table, id)),
			Effect.filterOrFail(isNonNil, () => new InvalidIdError({ table, id })),
		)
	}

	normalizeSystemId<T extends SystemTableNames>(table: T, id: string) {
		return QueryCtxService.pipe(
			Effect.map((ctx) => ctx.db.system.normalizeId(table, id)),
			Effect.filterOrFail(isNonNil, () => new InvalidIdError({ table, id })),
		)
	}

	insert<T extends TableNames>(table: T, data: WithoutSystemFields<DocumentByName<DataModel, T>>) {
		return MutationCtxService.pipe(
			Effect.flatMap((ctx) => Effect.promise(() => ctx.db.insert(table, data))),
		)
	}

	patch<T extends TableNames>(id: Id<T>, data: Partial<DocumentByName<DataModel, T>>) {
		return MutationCtxService.pipe(
			Effect.flatMap((ctx) => Effect.promise(() => ctx.db.patch(id, data))),
		)
	}

	delete<T extends TableNames>(id: Id<T>) {
		return MutationCtxService.pipe(Effect.flatMap((ctx) => Effect.promise(() => ctx.db.delete(id))))
	}
}

class ConvexEffectSystemDb {
	get<T extends SystemTableNames>(id: Id<T>) {
		return QueryCtxService.pipe(
			Effect.flatMap((ctx) => Effect.promise(() => ctx.db.system.get(id))),
			Effect.flatMap(docOrFail),
		)
	}

	query<T extends SystemTableNames>(table: T) {
		return new EffectQueryInitializer(
			QueryCtxService.pipe(Effect.map((ctx) => ctx.db.system.query(table))),
		)
	}
}

class OrderedEffectQuery<Info extends GenericTableInfo> {
	constructor(
		protected readonly query: Effect.Effect<OrderedQuery<Info>, never, QueryCtxService>,
	) {}

	filter(fn: (q: FilterBuilder<Info>) => ExpressionOrValue<boolean>) {
		return new OrderedEffectQuery(this.query.pipe(Effect.map((q) => q.filter(fn))))
	}

	collect() {
		return this.query.pipe(Effect.flatMap((q) => Effect.promise(() => q.collect())))
	}

	paginate(options: PaginationOptions) {
		return this.query.pipe(Effect.flatMap((q) => Effect.promise(() => q.paginate(options))))
	}

	take(n: number) {
		return this.query.pipe(Effect.flatMap((q) => Effect.promise(() => q.take(n))))
	}

	first() {
		return this.query.pipe(
			Effect.flatMap((q) => Effect.promise(() => q.first())),
			Effect.flatMap(docOrFail),
		)
	}

	unique() {
		return this.query.pipe(
			Effect.flatMap((q) => Effect.promise(() => q.unique())),
			Effect.flatMap(docOrFail),
		)
	}
}

class EffectQuery<Info extends GenericTableInfo> extends OrderedEffectQuery<Info> {
	protected readonly query: Effect.Effect<Query<Info>, never, QueryCtxService>

	constructor(query: Effect.Effect<Query<Info>, never, QueryCtxService>) {
		super(query)
		this.query = query
	}

	order(by: "asc" | "desc") {
		return new OrderedEffectQuery(this.query.pipe(Effect.map((q) => q.order(by))))
	}
}

class EffectQueryInitializer<Info extends GenericTableInfo> extends EffectQuery<Info> {
	protected readonly query: Effect.Effect<QueryInitializer<Info>, never, QueryCtxService>

	constructor(query: Effect.Effect<QueryInitializer<Info>, never, QueryCtxService>) {
		super(query)
		this.query = query
	}

	withIndex<IndexName extends IndexNames<Info>>(
		indexName: IndexName,
		fn: (q: IndexRangeBuilder<DocumentByInfo<Info>, NamedIndex<Info, IndexName>, 0>) => IndexRange,
	) {
		return new EffectQuery(this.query.pipe(Effect.map((q) => q.withIndex(indexName, fn))))
	}
}

export const Convex = {
	db: new ConvexEffectDb(),
	storage: {
		getUrl(storageId: Id<"_storage">) {
			return QueryCtxService.pipe(
				Effect.flatMap((ctx) => Effect.promise(() => ctx.storage.getUrl(storageId))),
				Effect.filterOrFail(isNonNil, () => new FileNotFoundError()),
			)
		},
		getMetadata(storageId: Id<"_storage">) {
			return QueryCtxService.pipe(
				Effect.flatMap((ctx) => Effect.promise(() => ctx.storage.getMetadata(storageId))),
				Effect.filterOrFail(
					(metadata) => metadata !== null,
					() => new FileNotFoundError(),
				),
			)
		},
		generateUploadUrl() {
			return MutationCtxService.pipe(
				Effect.flatMap((ctx) => Effect.promise(() => ctx.storage.generateUploadUrl())),
			)
		},
		delete(storageId: Id<"_storage">) {
			return MutationCtxService.pipe(
				Effect.flatMap((ctx) => Effect.promise(() => ctx.storage.delete(storageId))),
			)
		},
	},
}

/** @deprecated */
export function withQueryCtx<T>(fn: (ctx: QueryCtx) => T | PromiseLike<T>) {
	return QueryCtxService.pipe(Effect.flatMap((ctx) => Effect.promise(async () => await fn(ctx))))
}

/** @deprecated */
export function withMutationCtx<T>(fn: (ctx: MutationCtx) => T) {
	return MutationCtxService.pipe(Effect.flatMap((ctx) => Effect.promise(async () => await fn(ctx))))
}

/** @deprecated */
export function getDoc<T extends TableNames>(id: Id<T>) {
	return QueryCtxService.pipe(
		Effect.flatMap((ctx) => Effect.promise(() => ctx.db.get(id))),
		Effect.flatMap(docOrFail),
	)
}

/** @deprecated */
export function queryDoc<T>(fn: (ctx: QueryCtx) => Awaitable<Nullish<T>>) {
	return QueryCtxService.pipe(
		Effect.flatMap((ctx) => Effect.promise(async () => await fn(ctx))),
		Effect.flatMap(docOrFail),
	)
}

/** @deprecated */
export function insertDoc<T extends TableNames>(
	table: T,
	data: WithoutSystemFields<DocumentByName<DataModel, T>>,
) {
	return MutationCtxService.pipe(
		Effect.flatMap((ctx) => Effect.promise(() => ctx.db.insert(table, data))),
	)
}

/** @deprecated */
export function patchDoc<T extends TableNames>(
	id: Id<T>,
	data: Partial<DocumentByName<DataModel, T>>,
) {
	return MutationCtxService.pipe(
		Effect.flatMap((ctx) => Effect.promise(() => ctx.db.patch(id, data))),
	)
}

/** @deprecated */
export function deleteDoc<T extends TableNames>(id: Id<T>) {
	return MutationCtxService.pipe(Effect.flatMap((ctx) => Effect.promise(() => ctx.db.delete(id))))
}
