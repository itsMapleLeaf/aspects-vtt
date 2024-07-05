import { Disclosure, DisclosureContent, DisclosureProvider } from "@ariakit/react"
import { useQuery } from "convex/react"
import { LucideFolder, LucideFolderOpen, LucideImagePlus, LucideUserPlus2 } from "lucide-react"
import React, { useState } from "react"
import { useLocalStorageSwitch } from "~/helpers/dom/useLocalStorage.ts"
import type { JsonValue } from "~/helpers/json.ts"
import { Button } from "~/ui/Button.tsx"
import { Input } from "~/ui/Input.tsx"
import { ScrollArea } from "~/ui/ScrollArea.tsx"
import { withMergedClassName } from "~/ui/withMergedClassName.ts"
import { api } from "../../../convex/_generated/api"
import { useUser } from "../auth/hooks.ts"
import { CharacterResource } from "../characters/CharacterResource.tsx"
import { NewCharacterForm } from "../characters/NewCharacterForm.tsx"
import type { ApiCharacter } from "../characters/types.ts"
import { RoomOwnerOnly, useRoom } from "../rooms/roomContext.tsx"
import { NewSceneForm } from "../scenes/NewSceneForm.tsx"
import { SceneResource } from "../scenes/SceneResource.tsx"

export interface ResourceListProps extends React.ComponentProps<"div"> {}

export function ResourceList(props: ResourceListProps) {
	const { _id: roomId, currentScene } = useRoom()
	const characters = useQuery(api.characters.functions.list, { roomId })
	const scenes = useQuery(api.scenes.functions.list, { roomId })
	const user = useUser()
	const [searchState, setSearch] = useState("")
	const search = searchState.trim()
	const scene = useQuery(api.scenes.functions.get, currentScene ? { id: currentScene } : "skip")

	const characterOrder = (it: ApiCharacter) => {
		if (it.playerId === user?.clerkId) return 0
		if (it.playerId) return 1
		if (scene?.tokens?.some((token) => token.characterId === it._id)) return 2
		return Number.POSITIVE_INFINITY
	}

	return (
		<div {...withMergedClassName(props, "flex flex-col gap-2 h-full")}>
			<div className="flex gap-2">
				<Input placeholder="Search..." value={search} onChangeValue={setSearch} />
			</div>
			<div className="min-h-0 flex-1">
				<ScrollArea>
					<ResourceFolder
						name="Characters"
						end={
							<RoomOwnerOnly>
								<NewCharacterForm>
									<Button
										type="submit"
										icon={<LucideUserPlus2 />}
										appearance="clear"
										square
										tooltip="Add character"
									/>
								</NewCharacterForm>
							</RoomOwnerOnly>
						}
					>
						{characters
							?.toSorted((a, b) => characterOrder(a) - characterOrder(b))
							.map((character) => (
								<ResourceElement
									key={character._id}
									dragData={CharacterResource.create(character).dragData}
								>
									<CharacterResource.TreeItem character={character} />
								</ResourceElement>
							))}
					</ResourceFolder>
					<ResourceFolder
						name="Scenes"
						end={
							<RoomOwnerOnly>
								<NewSceneForm>
									<Button
										type="submit"
										icon={<LucideImagePlus />}
										appearance="clear"
										square
										tooltip="Add scene"
									/>
								</NewSceneForm>
							</RoomOwnerOnly>
						}
					>
						{scenes?.map((scene) => (
							<ResourceElement key={scene._id} dragData={scene}>
								<SceneResource.TreeItem scene={scene} />
							</ResourceElement>
						))}
					</ResourceFolder>
				</ScrollArea>
			</div>
		</div>
	)
}

function ResourceFolder({
	name,
	children,
	end,
}: {
	name: string
	children: React.ReactNode
	end?: React.ReactNode
}) {
	const [open, setOpen] = useLocalStorageSwitch(`resource-folder-${name}`, true)
	return (
		<DisclosureProvider open={open} setOpen={setOpen}>
			<div className="flex gap-1 [&:has(+:empty)]:hidden">
				<Disclosure
					render={
						<Button
							icon={open ? <LucideFolderOpen /> : <LucideFolder />}
							appearance="clear"
							className="w-full justify-start"
						/>
					}
				>
					{name}
				</Disclosure>
				{end}
			</div>
			<DisclosureContent className="flex flex-col pl-2">{children}</DisclosureContent>
		</DisclosureProvider>
	)
}

function ResourceElement({
	children,
	dragData,
}: {
	children: React.ReactNode
	dragData: JsonValue
}) {
	return (
		<div
			draggable
			onDragStart={(event) => {
				event.dataTransfer.dropEffect = "copy"
				event.dataTransfer.setData("text/plain", JSON.stringify(dragData))
				event.dataTransfer.setDragImage(
					event.currentTarget,
					event.currentTarget.clientWidth / 2,
					event.currentTarget.clientHeight / 2,
				)
			}}
		>
			{children}
		</div>
	)
}
