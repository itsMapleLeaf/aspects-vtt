import type { GenericEnt, GenericEntWriter } from "convex-ents"
import type { CustomCtx } from "convex-helpers/server/customFunctions"
import type { TableNames } from "../_generated/dataModel.d.ts"
import type { mutation, query } from "../helpers/functions.ts"
import type { entDefinitions } from "../schema.ts"

export type QueryCtx = CustomCtx<typeof query>
export type MutationCtx = CustomCtx<typeof mutation>

export type Ent<TableName extends TableNames> = GenericEnt<typeof entDefinitions, TableName>
export type EntWriter<TableName extends TableNames> = GenericEntWriter<
	typeof entDefinitions,
	TableName
>
