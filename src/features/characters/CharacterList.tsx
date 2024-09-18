import { useQuery } from "convex/react"
import { LoadingIcon } from "~/components/LoadingIcon.tsx"
import { api } from "~/convex/_generated/api.js"
import type { Id } from "~/convex/_generated/dataModel.js"
import { CharacterCard } from "./CharacterCard.tsx"

export function CharacterList({ roomId }: { roomId: Id<"rooms"> }) {
	const characters = useQuery(
		api.entities.characters.list,
		roomId ? { roomId } : "skip",
	)

	return characters === undefined ?
			<div className="flex flex-col items-center py-8">
				<LoadingIcon />
			</div>
		:	<div className="flex h-full min-h-0 flex-col overflow-y-auto gap">
				{characters.map((character) => (
					<CharacterCard key={character._id} character={character} />
				))}
			</div>
}
