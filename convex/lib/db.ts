import {
	GenericDocument,
	GenericTableInfo,
	Indexes,
	NamedTableInfo,
	OrderedQuery,
	PaginationOptions,
	Query,
} from "convex/server"
import { Data, Effect, pipe } from "effect"
import { DataModel, Doc, Id, TableNames } from "../_generated/dataModel"
import { MutationContextService, QueryContextService } from "./context.ts"

export class DocNotFoundError extends Data.TaggedError("DocNotFoundError") {
	constructor(readonly message: string) {
		super()
	}
}

const ensureDoc =
	(errorMessage: string) =>
	<D extends GenericDocument, E, S>(doc: Effect.Effect<D | null, E, S>) =>
		Effect.filterOrFail(
			doc,
			(doc): doc is D => doc != null,
			() => new DocNotFoundError(errorMessage),
		)

export function getDoc<T extends TableNames>(id: Id<T>) {
	return pipe(
		QueryContextService,
		Effect.flatMap((ctx) => Effect.promise(() => ctx.db.get(id))),
		ensureDoc(`Couldn't find document with ID "${id}"`),
	)
}

export function queryTable<T extends TableNames>(table: T) {
	return pipe(
		QueryContextService,
		Effect.map((ctx) => ctx.db.query(table)),
	)
}

export const queryIndex = <T extends TableNames, I extends TableIndexNames<T>>(
	table: T,
	index: I,
	...inputs: IndexInputs<T, I>
) =>
	pipe(
		QueryContextService,
		Effect.map((ctx) =>
			ctx.db.query(table).withIndex(index, (q) =>
				// @ts-expect-error
				inputs.reduce((q, [name, value]) => q.eq(name, value), q),
			),
		),
	)

export const orderQuery =
	(order: "asc" | "desc") =>
	<T extends GenericTableInfo>(query: Query<T>) =>
		query.order(order)

export const takeDocs =
	(count: number) =>
	<T extends GenericTableInfo>(query: OrderedQuery<T>) =>
		query.take(count)

export const getFirstDoc = <T extends GenericTableInfo>(
	query: OrderedQuery<T>,
) => Effect.promise(() => query.first()).pipe(ensureDoc(`No document found`))

export const getUniqueDoc = <T extends GenericTableInfo>(
	query: OrderedQuery<T>,
) => Effect.promise(() => query.unique()).pipe(ensureDoc(`No document found`))

export const collectDocs = <T extends GenericTableInfo>(
	query: OrderedQuery<T>,
) => Effect.promise(() => query.collect())

export const paginateDocs =
	(opts: PaginationOptions) =>
	<T extends GenericTableInfo>(query: OrderedQuery<T>) =>
		Effect.promise(() => query.paginate(opts))

export function patchDoc<T extends TableNames>(
	id: Id<T>,
	patch: Partial<Doc<T>>,
) {
	return pipe(
		MutationContextService,
		Effect.flatMap((ctx) => Effect.promise(() => ctx.db.patch(id, patch))),
	)
}

export function deleteDoc<T extends TableNames>(id: Id<T>) {
	return pipe(
		MutationContextService,
		Effect.flatMap((ctx) => Effect.promise(() => ctx.db.delete(id))),
	)
}

type TableIndexNames<T extends TableNames> = keyof Indexes<
	NamedTableInfo<DataModel, T>
>

type TableIndexes<T extends TableNames> = Indexes<NamedTableInfo<DataModel, T>>

type TableIndex<
	T extends TableNames,
	I extends TableIndexNames<T>,
> = TableIndexes<T>[I]

type IndexInputs<
	Table extends TableNames,
	Index extends TableIndexNames<Table>,
	State = TableIndex<Table, Index>,
> = State extends []
	? []
	: State extends ["_creationTime", ...infer Rest]
		? IndexInputs<Table, Index, Rest>
		: State extends [infer Key extends keyof Doc<Table>, ...infer Rest]
			? [[Key, Doc<Table>[Key]], ...IndexInputs<Table, Index, Rest>]
			: never
