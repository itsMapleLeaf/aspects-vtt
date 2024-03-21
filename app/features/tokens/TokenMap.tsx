import { useQuery } from "convex/react"
import { Vector } from "#app/common/vector.ts"
import { UploadedImage } from "#app/features/images/UploadedImage.tsx"
import { api } from "#convex/_generated/api.js"
import type { Id } from "#convex/_generated/dataModel.js"
import { useRoom } from "../rooms/roomContext.tsx"
import { Token } from "./Token.tsx"
import { TokenMapViewport } from "./TokenMapViewport.tsx"

export const mapSize = Vector.from(30)
export const cellSize = 50

export function TokenMap({
	selectedCharacterId,
	onSelectedCharacterChange,
}: {
	selectedCharacterId?: Id<"characters">
	onSelectedCharacterChange?: (id: Id<"characters">) => void
}) {
	const room = useRoom()
	const characters = useQuery(api.characters.listTokens, { roomId: room._id })
	const user = useQuery(api.auth.user)

	return (
		<TokenMapViewport
			background={
				room.mapImageId && (
					<UploadedImage
						id={room.mapImageId}
						className="absolute inset-0 size-full object-contain object-left-top brightness-75"
					/>
				)
			}
		>
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
