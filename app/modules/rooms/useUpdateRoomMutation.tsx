import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { queryMutators } from "../convex/helpers.ts"

export function useUpdateRoomMutation() {
	return useMutation(api.rooms.functions.update).withOptimisticUpdate(
		(store, { combat, ...args }) => {
			for (const mutator of queryMutators(store, api.rooms.functions.get)) {
				if (mutator.value) mutator.set({ ...mutator.value, ...args })
			}
		},
	)
}
