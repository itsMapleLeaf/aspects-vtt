import {
	mutationGeneric,
	paginationOptsValidator,
	queryGeneric,
	type DocumentByName,
	type GenericDataModel,
	type GenericMutationCtx,
	type GenericQueryCtx,
	type GenericTableIndexes,
	type SystemFields,
	type TableNamesInDataModel,
} from "convex/server"
import { v, type GenericId, type ObjectType, type PropertyValidators } from "convex/values"
import { Console, Effect, pipe } from "effect"
import { expect } from "../app/common/expect.ts"
import type { Simplify } from "../app/common/types.ts"
import { type MutationCtx, type QueryCtx } from "./_generated/server"
import { partial, type Branded } from "./helpers/convex.ts"
import { tables } from "./schema.ts"

export function defineTables<Tables extends { [name: string]: PropertyValidators }>(
	tables: Tables,
) {
	return new FunctionFactory(tables)
}

class FunctionFactory<Tables extends { [name: string]: PropertyValidators }> {
	readonly tables

	readonly __dataModel!: {
		[K in Extract<keyof Tables, string>]: {
			document: Simplify<{ _id: GenericId<K> } & SystemFields & ObjectType<Tables[K]>>
			indexes: GenericTableIndexes
			fieldPaths: string
			searchIndexes: {}
			vectorIndexes: {}
		}
	}

	constructor(tables: Tables) {
		this.tables = tables
	}

	crud<Table extends TableNamesInDataModel<typeof this.__dataModel>>(table: Table) {
		return {
			get: queryGeneric({
				args: {
					id: v.string(),
				},
				handler: this.queryHandler((ctx, args) => {
					return Effect.gen(function* () {
						const id = yield* ctx.normalizeId<Table>(table, args.id)
						return yield* ctx.getDoc(id)
					}).pipe(
						Effect.tapError(Console.warn),
						Effect.orElseSucceed(() => null),
					)
				}),
			}),

			getAll: queryGeneric(
				this.queryHandler((ctx) => Effect.promise(() => ctx.internal.db.query(table).collect())),
			),

			paginate: queryGeneric({
				args: {
					paginationOpts: paginationOptsValidator,
				},
				handler: this.queryHandler((ctx, args) => {
					return Effect.promise(() => ctx.internal.db.query(table).paginate(args.paginationOpts))
				}),
			}),

			create: mutationGeneric({
				args: expect(this.tables[table]),
				handler: this.mutationHandler((ctx, args) => {
					return Effect.promise(() => ctx.internal.db.insert(table, args as any))
				}),
			}),

			update: mutationGeneric({
				args: {
					id: v.string(),
					data: v.object(partial(expect(this.tables[table]))),
				},
				handler: this.mutationHandler((ctx, args) => {
					return Effect.gen(function* () {
						const id = yield* ctx.normalizeId(table, args.id)
						return yield* ctx.patchDoc(id, args.data as any)
					})
				}),
			}),

			remove: mutationGeneric({
				args: {
					id: v.string(),
				},
				handler: this.mutationHandler((ctx, args) => {
					return Effect.gen(function* () {
						const id = yield* ctx.normalizeId(table, args.id)
						return yield* ctx.deleteDoc(id)
					})
				}),
			}),
		}
	}

	queryHandler<Value, Args extends readonly [unknown] | readonly []>(
		makeEffect: (
			ctx: EffectQueryCtx<typeof this.__dataModel>,
			...optionalArgs: Args
		) => Effect.Effect<Value, unknown>,
	) {
		return (ctx: GenericQueryCtx<typeof this.__dataModel>, ...optionalArgs: Args) =>
			Effect.runPromise(makeEffect(new EffectQueryCtx(ctx), ...optionalArgs))
	}

	mutationHandler<Value, Args extends readonly [unknown] | readonly []>(
		makeEffect: (
			ctx: EffectMutationCtx<typeof this.__dataModel>,
			...optionalArgs: Args
		) => Effect.Effect<Value, unknown>,
	) {
		return (ctx: GenericMutationCtx<typeof this.__dataModel>, ...optionalArgs: Args) =>
			Effect.runPromise(makeEffect(new EffectMutationCtx(ctx), ...optionalArgs))
	}
}

class EffectQueryCtx<DataModel extends GenericDataModel> {
	readonly internal

	constructor(ctx: GenericQueryCtx<DataModel>) {
		this.internal = ctx
	}

	getDoc<Table extends TableNamesInDataModel<DataModel>>(id: GenericId<Table>) {
		return pipe(
			Effect.promise(() => this.internal.db.get(id)),
			Effect.mapError(() => new DocNotFoundError(id)),
		)
	}

	normalizeId<Table extends TableNamesInDataModel<DataModel>>(table: Table, id: string) {
		return pipe(
			Effect.sync(() => this.internal.db.normalizeId(table, id)),
			Effect.flatMap(Effect.fromNullable),
			Effect.mapError(() => new InvalidIdError(id, table)),
		)
	}
}

class EffectMutationCtx<DataModel extends GenericDataModel> extends EffectQueryCtx<DataModel> {
	readonly internal

	constructor(ctx: GenericMutationCtx<DataModel>) {
		super(ctx)
		this.internal = ctx
	}

	patchDoc<Table extends TableNamesInDataModel<DataModel>>(
		id: GenericId<Table>,
		data: Partial<DocumentByName<DataModel, Table>>,
	) {
		return Effect.promise(() => this.internal.db.patch(id, data))
	}

	deleteDoc<Table extends TableNamesInDataModel<DataModel>>(id: GenericId<Table>) {
		return Effect.promise(() => this.internal.db.delete(id))
	}
}

class DocNotFoundError extends Error {
	readonly _tag = "DocNotFoundError"
	constructor(readonly id: string) {
		super(`Doc not found for id "${id}"`)
	}
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

function test() {
	const crud = tables.crud("users")
	crud.get({} as QueryCtx, { id: "1" })
	crud.getAll({} as QueryCtx, {})
	crud.paginate({} as QueryCtx, { paginationOpts: { cursor: null, numItems: 20 } })
	crud.create({} as MutationCtx, { name: "Eden", clerkId: "eden12345" as Branded<"clerkId"> })
}
