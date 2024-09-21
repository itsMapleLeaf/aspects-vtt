import { entsTableFactory, GenericEnt, GenericEntWriter } from "convex-ents"
import {
	customCtx,
	CustomCtx,
	customMutation,
	customQuery,
} from "convex-helpers/server/customFunctions"
import type { TableNamesInDataModel } from "convex/server"
import * as generated from "../_generated/server"
import { entDefinitions } from "../schema"

export const query = customQuery(
	generated.query,
	customCtx(async (ctx) => {
		return {
			table: entsTableFactory(ctx, entDefinitions),
			db: undefined,
		}
	}),
)

export const internalQuery = customQuery(
	generated.internalQuery,
	customCtx(async (ctx) => {
		return {
			table: entsTableFactory(ctx, entDefinitions),
			db: undefined,
		}
	}),
)

export const mutation = customMutation(
	generated.mutation,
	customCtx(async (ctx) => {
		return {
			table: entsTableFactory(ctx, entDefinitions),
			db: undefined,
		}
	}),
)

export const internalMutation = customMutation(
	generated.internalMutation,
	customCtx(async (ctx) => {
		return {
			table: entsTableFactory(ctx, entDefinitions),
			db: undefined,
		}
	}),
)

export type EntQueryCtx = CustomCtx<typeof query>
export type EntMutationCtx = CustomCtx<typeof mutation>

export type EntTableNames = TableNamesInDataModel<typeof entDefinitions>

export type Ent<TableName extends EntTableNames> = GenericEnt<
	typeof entDefinitions,
	TableName
>
export type EntWriter<TableName extends EntTableNames> = GenericEntWriter<
	typeof entDefinitions,
	TableName
>
