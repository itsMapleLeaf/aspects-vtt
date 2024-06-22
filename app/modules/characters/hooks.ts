import { useMutation } from "convex/react"
import { useFilter } from "~/helpers/react/hooks.ts"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import { useSafeAction } from "../convex/hooks.ts"
import { useCharacter, useRoom } from "../rooms/roomContext.tsx"

export function useCreateCharacterMutation({
	onCreate,
}: {
	onCreate?: (id: Id<"characters">) => void
} = {}) {
	const room = useRoom()
	const createCharacter = useMutation(api.characters.functions.create)
	const [state, action] = useSafeAction(async () => {
		const id = await createCharacter({ roomId: room._id })
		onCreate?.(id)
		return id
	})
	const character = useFilter(useCharacter(state.value), (it) => it != null)
	return { action, character }
}
