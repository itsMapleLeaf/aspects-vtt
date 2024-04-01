import { useQuery } from "convex/react"
import { Fragment } from "react/jsx-runtime"
import { Vector } from "#app/common/vector.js"
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
	const characters = useQuery(api.characters.list, { roomId: room._id })
	return (
		<TokenMapViewport>
			{characters?.map((character) => (
				<Fragment key={character._id}>
					{character.tokenPosition ?
						<Token
							character={character}
							tokenPosition={Vector.from(character.tokenPosition)}
							selected={selectedCharacterId === character._id}
							onSelect={() => {
								onSelectedCharacterChange?.(character._id)
							}}
						/>
					:	null}
				</Fragment>
			))}
		</TokenMapViewport>
	)
}
