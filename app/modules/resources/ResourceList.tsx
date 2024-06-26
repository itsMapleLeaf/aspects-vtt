import { Disclosure, DisclosureContent, DisclosureProvider } from "@ariakit/react"
import { useQuery } from "convex/react"
import { LucideFolder, LucideFolderOpen, LucidePlus } from "lucide-react"
import React, { useState } from "react"
import { useLocalStorageSwitch } from "~/helpers/dom/useLocalStorage.ts"
import type { JsonValue } from "~/helpers/json.ts"
import { Button } from "~/ui/Button.tsx"
import { Input } from "~/ui/Input.tsx"
import { Menu, MenuButton, MenuPanel } from "~/ui/Menu.tsx"
import { ScrollArea } from "~/ui/ScrollArea.tsx"
import { withMergedClassName } from "~/ui/withMergedClassName.ts"
import { api } from "../../../convex/_generated/api"
import { useUser } from "../auth/hooks.ts"
import { CharacterResource } from "../characters/CharacterResource.tsx"
import type { ApiCharacter } from "../characters/types.ts"
import { useRoom } from "../rooms/roomContext.tsx"
import { SceneResource } from "../scenes/SceneResource.tsx"
import { listResourceDefinitions, type Resource } from "./Resource.tsx"

interface ResourceGroup {
	id: string
	name: string
	items: Resource[]
}

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

	// const characterItems = (characters ?? [])
	// 	.filter((character) => character.visible || character.isOwner)
	// 	// .sort((a, b) => b._creationTime - a._creationTime)
	// 	.sort((a, b) => characterOrder(a) - characterOrder(b))
	// 	.map((character) => CharacterResource.create(character))

	// let tree: ResourceGroup[] = [
	// 	{
	// 		id: "characters",
	// 		name: "Characters",
	// 		items: characterItems,
	// 	},
	// 	{
	// 		id: "scenes",
	// 		name: "Scenes",
	// 		items: (scenes ?? []).map((scene) => SceneResource.create(scene)),
	// 	},
	// ]

	// if (search) {
	// 	tree = tree
	// 		.map(
	// 			(group): ResourceGroup => ({
	// 				...group,
	// 				items: group.items.filter((item) =>
	// 					item.name.toLowerCase().includes(search.toLowerCase()),
	// 				),
	// 			}),
	// 		)
	// 		.filter(
	// 			(group) => group.name.toLowerCase().includes(search.toLowerCase()) || group.items?.length,
	// 		)
	// }

	// tree = tree.filter((group) => group.items?.length)

	return (
		<div {...withMergedClassName(props, "flex flex-col gap-2 h-full")}>
			<div className="flex gap-2">
				<Input placeholder="Search..." value={search} onChangeValue={setSearch} />
				<NewResourceMenu />
			</div>
			<div className="min-h-0 flex-1">
				<ScrollArea>
					<div className="pr-3">
						<ResourceFolder name="Characters">
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
						<ResourceFolder name="Scenes">
							{scenes?.map((scene) => (
								<ResourceElement key={scene._id} dragData={scene}>
									<SceneResource.TreeItem scene={scene} />
								</ResourceElement>
							))}
						</ResourceFolder>
					</div>
				</ScrollArea>
			</div>
		</div>
	)
}

function NewResourceMenu() {
	const [menuOpen, setMenuOpen] = useState(false)
	return (
		<Menu open={menuOpen} setOpen={setMenuOpen}>
			<Button icon={<LucidePlus />} tooltip="Add new..." element={<MenuButton />} />
			<MenuPanel unmountOnHide={false}>
				{[...listResourceDefinitions()].map((definition) => (
					<definition.CreateMenuItem key={definition.name} afterCreate={() => setMenuOpen(false)} />
				))}
			</MenuPanel>
		</Menu>
	)
}

function ResourceFolder({ name, children }: { name: string; children: React.ReactNode }) {
	const [open, setOpen] = useLocalStorageSwitch(`resource-folder-${name}`, true)
	return (
		<DisclosureProvider open={open} setOpen={setOpen}>
			<Disclosure
				render={
					<Button
						icon={open ? <LucideFolderOpen /> : <LucideFolder />}
						text={name}
						appearance="clear"
						className="w-full justify-start"
					/>
				}
			>
				{name}
			</Disclosure>
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
