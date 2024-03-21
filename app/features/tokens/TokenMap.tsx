import { useQuery } from "convex/react"
import { api } from "#convex/_generated/api.js"
import type { Id } from "#convex/_generated/dataModel.js"
import { useRoom } from "../rooms/roomContext.tsx"
import { Token } from "./Token.tsx"
import { TokenMapViewport } from "./TokenMapViewport.tsx"

export function TokenMap({
	selectedCharacterId,
	onSelectedCharacterChange,
}: {
	selectedCharacterId?: Id<"characters">
	onSelectedCharacterChange?: (id: Id<"characters">) => void
}) {
	const room = useRoom()
	const characters = useQuery(api.characters.listTokens, { roomId: room._id })
	return (
		<TokenMapViewport>
			{characters?.data?.map((character) => (
				<Token
					key={character._id}
					character={character}
					selected={selectedCharacterId === character._id}
					onSelect={() => {
						onSelectedCharacterChange?.(character._id)
					}}
				/>
			))}
		</TokenMapViewport>
	)
}
