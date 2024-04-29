import * as Lucide from "lucide-react"
import { useState } from "react"
import { Vector } from "../../common/vector.ts"
import { editCharacterEvent } from "./events.ts"
import { UploadedImage } from "../images/UploadedImage.tsx"
import { useRoom } from "../rooms/roomContext.tsx"
import { TokenElement } from "../tokens/TokenElement.tsx"
import type { ApiCharacter } from "../characters/types.ts"
import { TokenLabel, TokenSelectionOutline } from "../tokens/TokenMap.tsx"
import { CharacterContextMenu } from "./CharacterContextMenu.tsx"
import { CharacterQuickMenu } from "./CharacterQuickMenu.tsx"

export function CharacterTokenElement(props: {
	character: ApiCharacter
	selected: boolean
	onSelect: () => void
	onMove: (position: Vector) => Promise<unknown>
}) {
	const room = useRoom()
	const [moving, setMoving] = useState(false)
	return (
		<TokenElement
			token={props.character.token}
			size={Vector.from(room.mapCellSize)}
			onPointerDown={(event) => {
				if (event.button === 0) {
					props.onSelect()
					setMoving(true)
				}
			}}
			onDoubleClick={(event) => {
				editCharacterEvent.emit(props.character._id)
			}}
			onMoveFinish={async (...args) => {
				setMoving(false)
				await props.onMove(...args)
			}}
			attachments={
				<TokenLabel
					text={
						props.character.isOwner || props.character.nameVisible
							? `${props.character.displayName}\n(${props.character.displayPronouns})`
							: "???"
					}
				/>
			}
		>
			{props.selected && <TokenSelectionOutline />}
			<CharacterQuickMenu character={props.character} />
			<CharacterContextMenu character={props.character}>
				<UploadedImage
					id={props.character.imageId}
					emptyIcon={<Lucide.Ghost />}
					data-hidden={!props.character.token.visible}
					className="relative size-full transition-opacity data-[hidden=true]:opacity-50"
				/>
			</CharacterContextMenu>
		</TokenElement>
	)
}
