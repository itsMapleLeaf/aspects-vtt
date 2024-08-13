import { v } from "convex/values"
import { Effect } from "effect"
import {
	Convex,
	effectMutation,
	internalEffectQuery,
} from "./helpers/effect.ts"

export const getUploadUrl = effectMutation({
	args: {},
	handler: () => Convex.storage.generateUploadUrl(),
})

export const getMetadata = internalEffectQuery({
	args: {
		storageId: v.id("_storage"),
	},
	handler: ({ storageId }) =>
		Convex.db.system.get(storageId).pipe(Effect.orElseSucceed(() => null)),
})

export const remove = effectMutation({
	args: {
		storageId: v.id("_storage"),
	},
	handler(args) {
		return Convex.storage.delete(args.storageId)
	},
})
