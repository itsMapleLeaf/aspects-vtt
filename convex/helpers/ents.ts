import type {
	GenericEnt,
	GenericEntWriter,
	PromiseTable,
	PromiseTableWriter,
} from "convex-ents"
import { entsTableFactory } from "convex-ents"
import type { CustomCtx } from "convex-helpers/server/customFunctions"
import {
	customCtx,
	customMutation,
	customQuery,
} from "convex-helpers/server/customFunctions"
import type { TableNames } from "../_generated/dataModel.js"
import * as server from "../_generated/server.js"
import { entDefinitions } from "../schema.ts"

export type QueryCtx = CustomCtx<typeof query>
export type MutationCtx = CustomCtx<typeof mutation>

export type Ent<TableName extends TableNames> = GenericEnt<
	typeof entDefinitions,
	TableName
>
export type EntWriter<TableName extends TableNames> = GenericEntWriter<
	typeof entDefinitions,
	TableName
>

export type EntTable<TableName extends TableNames> = PromiseTable<
	typeof entDefinitions,
	TableName
>
export type EntTableWriter<TableName extends TableNames> = PromiseTableWriter<
	TableName,
	typeof entDefinitions
>

export const query = customQuery(
	server.query,
	customCtx(async (ctx) => {
		return {
			table: entsTableFactory(ctx, entDefinitions),
			db: ctx.db as server.DatabaseReader,
		}
	}),
)

export const internalQuery = customQuery(
	server.internalQuery,
	customCtx(async (ctx) => {
		return {
			table: entsTableFactory(ctx, entDefinitions),
			db: ctx.db as server.DatabaseReader,
		}
	}),
)

export const mutation = customMutation(
	server.mutation,
	customCtx(async (ctx) => {
		return {
			table: entsTableFactory(ctx, entDefinitions),
			db: ctx.db as server.DatabaseWriter,
		}
	}),
)

export const internalMutation = customMutation(
	server.internalMutation,
	customCtx(async (ctx) => {
		return {
			table: entsTableFactory(ctx, entDefinitions),
			db: ctx.db as server.DatabaseWriter,
		}
	}),
)
