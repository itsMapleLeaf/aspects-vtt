import {
	EffectActionCtx,
	EffectMutationCtx,
	EffectQueryCtx,
	createServerApi,
} from "@maple/convex-effect"
import { DataModel } from "../_generated/dataModel"

export const {
	query,
	internalQuery,
	mutation,
	internalMutation,
	action,
	internalAction,
	httpAction,
} = createServerApi<DataModel>()

export type LocalQueryContext = EffectQueryCtx<DataModel>
export type LocalMutationContext = EffectMutationCtx<DataModel>
export type LocalActionContext = EffectActionCtx<DataModel>
