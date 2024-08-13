import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { patchByKey } from "../../helpers/iterable.ts"
import { queryMutators } from "../convex/helpers.ts"

export function useUpdateTokenMutation() {
	return useMutation(api.scenes.tokens.functions.update).withOptimisticUpdate(
		(store, args) => {
			for (const entry of queryMutators(
				store,
				api.scenes.tokens.functions.list,
			)) {
				if (!entry.value) continue
				entry.set(patchByKey(entry.value, "key", args).toArray())
			}
		},
	)
}
