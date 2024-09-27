import { useQuery } from "convex/react"
import { LoadingIcon } from "~/components/LoadingIcon.tsx"
import { api } from "~/convex/_generated/api.js"
import { useRoomContext } from "../rooms/context.tsx"
import { CharacterCard } from "./CharacterCard.tsx"

export function CharacterList() {
	const room = useRoomContext()
	const characters = useQuery(api.characters.list, {
		roomId: room._id,
	})
	return characters === undefined ? (
		<div className="flex flex-col items-center py-8">
			<LoadingIcon />
		</div>
	) : (
		<div className="flex h-full min-h-0 flex-col overflow-y-auto border-t border-primary-700 *:border-b *:border-primary-700 *:py-3">
			{characters.map((character) => (
				<CharacterCard key={character.public._id} character={character} />
			))}
		</div>
	)
}
