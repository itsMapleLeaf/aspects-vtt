import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel"

export function useUpdateCharacterMutation(roomId: Id<"rooms">) {
	return useMutation(api.characters.functions.update).withOptimisticUpdate(
		(store, { id, ...args }) => {
			const data = store.getQuery(api.characters.functions.list, { roomId })
			if (data) {
				store.setQuery(
					api.characters.functions.list,
					{ roomId },
					// @ts-expect-error
					data.map((it) => (it._id === id ? { ...it, ...args } : it)),
				)
			}
		},
	)
}
