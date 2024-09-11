import { entsTableFactory, GenericEnt, GenericEntWriter } from "convex-ents"
import {
	customCtx,
	CustomCtx,
	customMutation,
	customQuery,
} from "convex-helpers/server/customFunctions"
import type { TableNamesInDataModel } from "convex/server"
import {
	internalMutation as baseInternalMutation,
	internalQuery as baseInternalQuery,
	mutation as baseMutation,
	query as baseQuery,
} from "../_generated/server"
import { entDefinitions } from "../schema"

export const query = customQuery(
	baseQuery,
	customCtx(async (ctx) => {
		return {
			table: entsTableFactory(ctx, entDefinitions),
			db: undefined,
		}
	}),
)

export const internalQuery = customQuery(
	baseInternalQuery,
	customCtx(async (ctx) => {
		return {
			table: entsTableFactory(ctx, entDefinitions),
			db: undefined,
		}
	}),
)

export const mutation = customMutation(
	baseMutation,
	customCtx(async (ctx) => {
		return {
			table: entsTableFactory(ctx, entDefinitions),
			db: undefined,
		}
	}),
)

export const internalMutation = customMutation(
	baseInternalMutation,
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
