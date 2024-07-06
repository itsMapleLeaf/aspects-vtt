import { Disclosure, DisclosureContent, DisclosureProvider } from "@ariakit/react"
import { useQuery } from "convex/react"
import type { FunctionReference, OptionalRestArgs } from "convex/server"
import * as Lucide from "lucide-react"
import { LucideFolder, LucideFolderOpen, LucideImagePlus, LucideUserPlus2 } from "lucide-react"
import React, { useState } from "react"
import { z } from "zod"
import { nonEmpty } from "~/helpers/array.ts"
import { useLocalStorageState, useLocalStorageSwitch } from "~/helpers/dom/useLocalStorage.ts"
import type { JsonValue } from "~/helpers/json.ts"
import { mod } from "~/helpers/math.ts"
import { Button } from "~/ui/Button.tsx"
import { Input } from "~/ui/Input.tsx"
import { MenuItem } from "~/ui/Menu.tsx"
import { ScrollArea } from "~/ui/ScrollArea.tsx"
import { withMergedClassName } from "~/ui/withMergedClassName.ts"
import { api } from "../../../convex/_generated/api"
import { CharacterResource } from "../characters/CharacterResource.tsx"
import { NewCharacterForm } from "../characters/NewCharacterForm.tsx"
import { ConvexDeleteForm } from "../convex/ConvexDeleteForm.tsx"
import { RoomOwnerContextMenu } from "../rooms/RoomOwnerContextMenu.tsx"
import { RoomOwnerOnly, useRoom } from "../rooms/roomContext.tsx"
import { NewSceneForm } from "../scenes/NewSceneForm.tsx"
import { SceneResource } from "../scenes/SceneResource.tsx"
import { useCurrentSceneTokens } from "../scenes/hooks.ts"

export interface ResourceListProps extends React.ComponentProps<"div"> {}

export function ResourceList(props: ResourceListProps) {
	const { _id: roomId } = useRoom()
	const characters = useQuery(api.characters.functions.list, { roomId })
	const scenes = useQuery(api.scenes.functions.list, { roomId })

	const tokens = useCurrentSceneTokens()
	const sceneCharacterIds = new Set(tokens.map((it) => it.characterId).filter(Boolean))

	const [searchState, setSearch] = useState("")
	const search = searchState.trim()

	interface Sortable {
		name?: string
		_creationTime: number
	}

	const sorts = nonEmpty([
		{
			id: "recently-created",
			name: "Recently created",
			icon: <Lucide.Clock />,
			sort: (a: Sortable, b: Sortable) => b._creationTime - a._creationTime,
		},
		{
			id: "alphabetical",
			name: "Alphabetical",
			icon: <Lucide.ArrowDownAZ />,
			sort: (a: Sortable, b: Sortable) => (a.name ?? "").localeCompare(b.name ?? ""),
		},
	])

	const [sortId, setSortId] = useLocalStorageState(
		"resource-list-sort",
		sorts[0].id ?? null,
		z.string(),
	)
	const currentSort = sorts.find((it) => it.id === sortId) ?? sorts[0]

	const sortItems = <T extends Sortable>(items: Iterable<T>) =>
		Array.from(items).toSorted(currentSort.sort)

	return (
		<div {...withMergedClassName(props, "flex flex-col gap-2 h-full")}>
			<div className="flex gap-2">
				<Input
					placeholder="Search..."
					value={search}
					onChangeValue={setSearch}
					className="flex-1"
				/>
				<Button
					icon={currentSort.icon}
					tooltip="Toggle sort"
					appearance="clear"
					square
					onClick={() => {
						setSortId((sortId) => {
							const index = sorts.findIndex((it) => it.id === sortId)
							const nextSort = (index > -1 && sorts[mod(index - 1, sorts.length)]) || sorts[0]
							return nextSort.id
						})
					}}
				/>
			</div>
			<div className="min-h-0 flex-1">
				<ScrollArea className="-ml-2 -mr-2">
					<div className="pl-2 pr-3">
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
							{sortItems(characters ?? [])
								.sort(
									(a, b) =>
										Number(sceneCharacterIds.has(b._id)) - Number(sceneCharacterIds.has(a._id)),
								)
								.map((character) => (
									<ResourceElement
										key={character._id}
										dragData={CharacterResource.create(character).dragData}
									>
										<ResourceMenu
											kind="character"
											name={character.name ?? "this character"}
											deleteMutation={api.characters.functions.remove}
											deleteArgs={{ id: character._id }}
										>
											<CharacterResource.TreeItem character={character} />
										</ResourceMenu>
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
							{sortItems(scenes ?? []).map((scene) => (
								<ResourceElement key={scene._id} dragData={scene}>
									<ResourceMenu
										kind="scene"
										name={scene.name}
										deleteMutation={api.scenes.functions.remove}
										deleteArgs={{ id: scene._id }}
									>
										<SceneResource.TreeItem scene={scene} />
									</ResourceMenu>
								</ResourceElement>
							))}
						</ResourceFolder>
					</div>
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
	end,
}: {
	children: React.ReactNode
	dragData: JsonValue
	end?: React.ReactNode
}) {
	return (
		<div className="flex gap-1">
			<div
				className="min-w-0 flex-1"
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
			{end}
		</div>
	)
}

function ResourceMenu<DeleteMutation extends FunctionReference<"mutation", "public">>({
	kind,
	name,
	deleteMutation,
	deleteArgs,
	children,
}: {
	kind: string
	name: string
	deleteMutation: DeleteMutation
	deleteArgs: OptionalRestArgs<DeleteMutation>[0]
	children: React.ReactNode
}) {
	return (
		<RoomOwnerContextMenu trigger={children}>
			<ConvexDeleteForm kind={kind} name={name} mutation={deleteMutation} args={deleteArgs}>
				<MenuItem icon={<Lucide.Trash />} hideOnClick={false} type="submit">
					Delete {name}
				</MenuItem>
			</ConvexDeleteForm>
		</RoomOwnerContextMenu>
	)
}
