import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { typed } from "~/helpers/types.ts"
import { api } from "../../../convex/_generated/api.js"
import { ResourceGroup, ResourceTreeItem } from "../resources/ResourceTree.tsx"
import { useRoom } from "../rooms/roomContext.tsx"
import { CharacterImage } from "./CharacterImage.tsx"
import { CharacterModal } from "./CharacterModal.tsx"
import type { CharacterResourceData } from "./types.ts"

export function CharacterResourceGroup() {
	const room = useRoom()
	const characters = useQuery(api.characters.functions.list, { roomId: room._id })
	const createCharacter = useMutation(api.characters.functions.create)
	const deleteCharacter = useMutation(api.characters.functions.remove)

	return (
		<ResourceGroup
			id="characters"
			name="Characters"
			add={{
				label: "Add character",
				icon: <Lucide.UserPlus2 />,
				action: async () => {
					await createCharacter({ roomId: room._id })
				},
			}}
			items={(characters ?? []).map((character) => ({
				key: character._id,
				name: character.name ?? "???",
				timestamp: character._creationTime,
				data: character,
			}))}
			renderItem={(character) => (
				<CharacterModal character={character}>
					<CharacterModal.Button
						render={
							<ResourceTreeItem
								key={character._id}
								resourceName={character.name ?? "???"}
								resourceType="character"
								icon={<CharacterImage character={character} className="rounded-full" />}
								dragData={typed<CharacterResourceData>({
									characterId: character._id,
									visible: character.visible,
								})}
								delete={async () => {
									await deleteCharacter({ id: character._id })
								}}
							>
								{character.name ?? "???"}
							</ResourceTreeItem>
						}
					/>
				</CharacterModal>
			)}
		/>
	)
}
