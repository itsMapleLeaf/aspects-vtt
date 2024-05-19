import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import type { Branded } from "../../../convex/helpers/convex.ts"
import { keyedByProperty } from "../../common/collection.ts"
import { queryMutators } from "../../common/convex.ts"
import { useCharacters } from "../rooms/roomContext.tsx"

export function useAddTokenMutation() {
	const characters = useCharacters()
	return useMutation(api.scenes.tokens.functions.add).withOptimisticUpdate(
		(store, args) => {
			const charactersById = keyedByProperty(characters, "_id")
			for (const entry of queryMutators(
				store,
				api.scenes.tokens.functions.list,
			)) {
				entry.set([
					...entry.value,
					{
						...args,
						key: crypto.randomUUID() as Branded<"token">,
						character:
							args.characterId ?
								charactersById.get(args.characterId)
							:	undefined,
					},
				])
			}
		},
	)
}
