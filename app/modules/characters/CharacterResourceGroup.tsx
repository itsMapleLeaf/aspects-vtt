import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { useDeferredValue, type ComponentProps } from "react"
import { z } from "zod"
import { typed } from "~/helpers/types.ts"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel"
import { ResourceGroup, ResourceTreeItem } from "../resources/ResourceTree.tsx"
import { useRoom } from "../rooms/roomContext.tsx"
import { CharacterImage } from "./CharacterImage.tsx"
import { CharacterModal } from "./CharacterModal.tsx"
import { characterDragData, type ApiCharacter, type CharacterDragData } from "./types.ts"

interface CharacterResourceGroupProps {
	id: string
	title: string
	sceneId: Id<"scenes"> | null
}

export function CharacterResourceGroup({ id, title, sceneId }: CharacterResourceGroupProps) {
	const room = useRoom()

	let characters = useQuery(api.characters.functions.list, { roomId: room._id }) ?? []
	if (sceneId) {
		characters = characters.filter((character) => character.sceneId === sceneId)
	} else {
		characters = characters.filter((character) => character.sceneId == null)
	}

	const createCharacter = useMutation(api.characters.functions.create)
	const deferredCharacters = useDeferredValue(characters)

	const updateCharacter = useMutation(api.characters.functions.update).withOptimisticUpdate(
		(store, { id, ...args }) => {
			const data = store.getQuery(api.characters.functions.list, { roomId: room._id })
			if (data) {
				store.setQuery(
					api.characters.functions.list,
					{ roomId: room._id },
					data.map((it) => (it._id === id ? { ...it, ...args } : it)),
				)
			}
		},
	)

	return (
		<div
			onDragOver={(event) => {
				event.preventDefault()
				event.dataTransfer.dropEffect = "move"
			}}
			onDrop={(event) => {
				const result = z
					.string()
					.transform((text) => JSON.parse(text))
					.pipe(characterDragData)
					.safeParse(event.dataTransfer.getData("text/plain"))

				if (!result.success) return

				updateCharacter({
					id: result.data.characterId,
					sceneId: sceneId ?? null,
				})
			}}
		>
			<ResourceGroup
				id={id}
				name={title}
				add={{
					label: "Add character",
					icon: <Lucide.UserPlus2 />,
					action: async () => {
						await createCharacter({
							roomId: room._id,
							sceneId: sceneId ?? null,
						})
					},
				}}
				items={deferredCharacters.map((character) => ({
					key: character._id,
					name: character.name ?? "???",
					timestamp: character._creationTime,
					data: character,
				}))}
				renderItem={(character) => (
					<CharacterModal character={character}>
						<CharacterModal.Button render={<CharacterResourceTreeItem character={character} />} />
					</CharacterModal>
				)}
			/>
		</div>
	)
}

function CharacterResourceTreeItem({
	character,
	...props
}: { character: ApiCharacter } & Partial<ComponentProps<typeof ResourceTreeItem>>) {
	const deleteCharacter = useMutation(api.characters.functions.remove)
	return (
		<ResourceTreeItem
			key={character._id}
			resourceName={character.name ?? "???"}
			resourceType="character"
			dragData={typed<CharacterDragData>({
				characterId: character._id,
				visible: character.visible,
			})}
			icon={<CharacterImage character={character} className="rounded-full" />}
			delete={async () => {
				await deleteCharacter({ id: character._id })
			}}
			{...props}
		>
			{character.name ?? "???"}
		</ResourceTreeItem>
	)
}
