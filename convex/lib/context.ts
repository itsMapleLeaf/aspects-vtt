import { Context } from "effect"
import { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server"

export class QueryContextService extends Context.Tag("QueryContextService")<
	QueryContextService,
	QueryCtx
>() {}

export class MutationContextService extends Context.Tag(
	"MutationContextService",
)<MutationContextService, MutationCtx>() {}

export class ActionContextService extends Context.Tag("ActionContextService")<
	ActionContextService,
	ActionCtx
>() {}
