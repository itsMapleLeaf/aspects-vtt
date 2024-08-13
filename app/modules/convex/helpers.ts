import type { OptimisticLocalStore } from "convex/browser"
import type {
	FunctionArgs,
	FunctionReference,
	FunctionReturnType,
} from "convex/server"

export interface QueryMutatorEntry<
	Query extends FunctionReference<"query", "public">,
> {
	value: FunctionReturnType<Query>
	args: FunctionArgs<Query>
	set: (value: FunctionReturnType<Query>) => void
}

export function* queryMutators<
	Query extends FunctionReference<"query", "public">,
>(
	store: OptimisticLocalStore,
	query: Query,
): Generator<QueryMutatorEntry<Query>, void, undefined> {
	for (const entry of store.getAllQueries(query)) {
		if (entry.value === undefined) continue
		yield {
			...entry,
			set(data) {
				store.setQuery(query, entry.args, data)
			},
		}
	}
}
