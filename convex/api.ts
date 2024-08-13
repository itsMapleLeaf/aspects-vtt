import {
	type EffectActionCtx,
	type EffectMutationCtx,
	type EffectQueryCtx,
	createServerApi,
} from "@maple/convex-effect"
import type { DataModel } from "./_generated/dataModel"

export const {
	query,
	internalQuery,
	mutation,
	internalMutation,
	action,
	internalAction,
	httpAction,
} = createServerApi<DataModel>()

export type LocalQueryCtx = EffectQueryCtx<DataModel>
export type LocalMutationCtx = EffectMutationCtx<DataModel>
export type LocalActionCtx = EffectActionCtx<DataModel>
