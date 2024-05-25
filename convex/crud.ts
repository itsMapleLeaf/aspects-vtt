import {
	mutationGeneric,
	paginationOptsValidator,
	queryGeneric,
	type GenericMutationCtx,
	type GenericQueryCtx,
	type GenericTableIndexes,
	type SystemFields,
} from "convex/server"
import { v, type GenericId, type ObjectType, type PropertyValidators } from "convex/values"
import { Console, Context, Effect } from "effect"
import { expect } from "../app/common/expect.ts"
import type { Simplify } from "../app/common/types.ts"
import { type MutationCtx, type QueryCtx } from "./_generated/server"
import { partial, type Branded } from "./helpers/convex.ts"
import { createCrudFunctions } from "./schema.ts"

export function defineTables<Tables extends { [name: string]: PropertyValidators }>(
	tables: Tables,
) {
	type DataModel = {
		[K in Extract<keyof Tables, string>]: {
			document: Simplify<{ _id: GenericId<K> } & SystemFields & ObjectType<Tables[K]>>
			indexes: GenericTableIndexes
			fieldPaths: string
			searchIndexes: {}
			vectorIndexes: {}
		}
	}

	type QueryCtx = GenericQueryCtx<DataModel>
	type MutationCtx = GenericMutationCtx<DataModel>

	class QueryCtxService extends Context.Tag("QueryCtxService")<QueryCtxService, QueryCtx>() {}

	function effectQueryHandler<Value, Args>(
		handler: (args: Args) => Effect.Effect<Value, unknown, QueryCtxService>,
	) {
		return (ctx: QueryCtx, args: Args) =>
			handler(args).pipe(Effect.provideService(QueryCtxService, ctx), Effect.runPromise)
	}

	class MutationCtxService extends Context.Tag("MutationCtxService")<
		MutationCtxService,
		MutationCtx
	>() {}

	function effectMutationHandler<Value, Args>(
		handler: (args: Args) => Effect.Effect<Value, unknown, QueryCtxService | MutationCtxService>,
	) {
		return (ctx: MutationCtx, args: Args) =>
			handler(args).pipe(
				Effect.provideService(QueryCtxService, ctx),
				Effect.provideService(MutationCtxService, ctx),
				Effect.runPromise,
			)
	}

	class DocNotFoundError extends Error {
		readonly _tag = "DocNotFoundError"
		constructor(
			readonly id: string,
			readonly table: string,
		) {
			super(`Doc not found for id "${id}" in table "${table}"`)
		}
	}

	function getDoc<Table extends Extract<keyof Tables, string>>(table: Table, id: GenericId<Table>) {
		return QueryCtxService.pipe(
			Effect.flatMap((ctx) => Effect.promise(() => ctx.db.get(id))),
			Effect.filterOrFail(
				(doc) => doc != null,
				() => new DocNotFoundError(id, table),
			),
		)
	}

	class InvalidIdError extends Error {
		readonly _tag = "InvalidIdError"
		constructor(
			readonly id: string,
			readonly table: string,
		) {
			super(`Invalid id "${id}" for table "${table}"`)
		}
	}

	function normalizeId<Table extends Extract<keyof Tables, string>>(table: Table, id: string) {
		return QueryCtxService.pipe(
			Effect.map((ctx) => ctx.db.normalizeId(table, id)),
			Effect.filterOrFail(
				(id) => id != null,
				() => new InvalidIdError(id, table),
			),
		)
	}

	return {
		createCrudFunctions<Table extends Extract<keyof Tables, string>>(table: Table) {
			return {
				get: queryGeneric({
					args: {
						id: v.string(),
					},
					handler: effectQueryHandler((args) => {
						return Effect.gen(function* () {
							const id = yield* normalizeId<Table>(table, args.id)
							return yield* getDoc(table, id)
						}).pipe(
							Effect.tapError(Console.warn),
							Effect.orElseSucceed(() => null),
						)
					}),
				}),

				getAll: queryGeneric({
					handler(ctx: QueryCtx) {
						return ctx.db.query(table).collect()
					},
				}),

				paginate: queryGeneric({
					args: {
						paginationOpts: paginationOptsValidator,
					},
					handler(ctx: QueryCtx, args) {
						return ctx.db.query(table).paginate(args.paginationOpts)
					},
				}),

				create: mutationGeneric({
					args: expect(tables[table]),
					handler(ctx: MutationCtx, args) {
						return ctx.db.insert(table, args as any)
					},
				}),

				update: mutationGeneric({
					args: {
						id: v.string(),
						data: v.object(partial(expect(tables[table]))),
					},
					handler: effectMutationHandler((args) => {
						return Effect.gen(function* () {
							const id = yield* normalizeId<Table>(table, args.id)
							const ctx = yield* MutationCtxService
							return yield* Effect.promise(() => ctx.db.patch(id, args.data as any))
						})
					}),
				}),

				remove: mutationGeneric({
					args: {
						id: v.string(),
					},
					handler: effectMutationHandler((args) => {
						return Effect.gen(function* () {
							const id = yield* normalizeId<Table>(table, args.id)
							const ctx = yield* MutationCtxService
							return yield* Effect.promise(() => ctx.db.delete(id))
						})
					}),
				}),
			}
		},
	}
}

function test() {
	const crud = createCrudFunctions("users")
	crud.get({} as QueryCtx, { id: "1" })
	crud.getAll({} as QueryCtx, {})
	crud.paginate({} as QueryCtx, { paginationOpts: { cursor: null, numItems: 20 } })
	crud.create({} as MutationCtx, { name: "Eden", clerkId: "eden12345" as Branded<"clerkId"> })
}
