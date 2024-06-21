import { Disclosure, DisclosureContent, DisclosureProvider } from "@ariakit/react"
import { Link } from "@remix-run/react"
import { useQuery } from "convex/react"
import { LucideFolder, LucideFolderOpen } from "lucide-react"
import { useState } from "react"
import { Button } from "~/ui/Button.tsx"
import { Input } from "~/ui/Input.tsx"
import { ScrollArea } from "~/ui/ScrollArea.tsx"
import { withMergedClassName } from "~/ui/withMergedClassName.ts"
import { api } from "../../../convex/_generated/api"
import { useUser } from "../auth/hooks.ts"
import { CharacterResource } from "../characters/CharacterResource.tsx"
import type { ApiCharacter } from "../characters/types.ts"
import { useCharacters, useRoom } from "../rooms/roomContext.tsx"
import type { Resource } from "./Resource.tsx"

interface ResourceGroup {
	id: string
	name: string
	items: Resource[]
}

export interface ResourceListProps extends React.ComponentProps<"div"> {}

export function ResourceList(props: ResourceListProps) {
	const room = useRoom()
	const characters = useCharacters()
	const scenes = useQuery(api.scenes.functions.list, { roomId: room._id })
	const user = useUser()
	const [searchState, setSearch] = useState("")
	const search = searchState.trim()

	let tree: ResourceGroup[] = [
		{
			id: "characters",
			name: "Characters",
			items: characters
				.filter((character) => character.visible || character.isOwner)
				.sort((a, b) => b._creationTime - a._creationTime)
				.sort((a, b) => {
					const order = (it: ApiCharacter) =>
						[it.playerId === user?.clerkId, it.isOwner, it.visible].indexOf(true)
					return order(a) - order(b)
				})
				.map((character) => CharacterResource.create(character, room.slug)),
		},
		// {
		// 	id: "scenes",
		// 	name: "Scenes",
		// 	items: scenes?.map((scene) => ({
		// 		id: scene._id,
		// 		name: scene.name,
		// 		icon: <LucideImage />,
		// 		location: $path(
		// 			"/rooms/:slug/:view?",
		// 			{ slug: room.slug, view: "scene" },
		// 			{ id: scene._id },
		// 		),
		// 	})),
		// },
	]

	if (search) {
		tree = tree
			.map((group) => ({
				...group,
				children: group.items?.filter((item) =>
					item.name.toLowerCase().includes(search.toLowerCase()),
				),
			}))
			.filter(
				(group) =>
					group.name.toLowerCase().includes(search.toLowerCase()) || group.children?.length,
			)
	}

	return (
		<div {...withMergedClassName(props, "flex flex-col gap-2 h-full")}>
			<div className="min-h-0 flex-1">
				<ScrollArea>
					<div className="pr-3">
						{tree.map((group) => (
							<ResourceFolder key={group.id} name={group.name}>
								{group.items?.map((resource) => (
									<ResourceElement key={resource.id} resource={resource} />
								))}
							</ResourceFolder>
						))}
					</div>
				</ScrollArea>
			</div>
			<Input placeholder="Search..." value={search} onChangeValue={setSearch} />
		</div>
	)
}

function ResourceFolder({ name, children }: { name: string; children: React.ReactNode }) {
	const [open, setOpen] = useState(true)
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

function ResourceElement({ resource }: { resource: Resource }) {
	const commonProps = {
		draggable: true,
		onDragStart: (event: React.DragEvent) => {
			event.dataTransfer.dropEffect = "copy"
			event.dataTransfer.setData("text/plain", JSON.stringify(resource.dragData))
			event.dataTransfer.setDragImage(
				event.currentTarget,
				event.currentTarget.clientWidth / 2,
				event.currentTarget.clientHeight / 2,
			)
		},
	}
	return (
		<Button
			key={resource.id}
			text={resource.name}
			icon={resource.renderIcon()}
			appearance="clear"
			className="justify-start"
			element={
				resource.action?.type === "link" ? <Link {...commonProps} to={resource.action.location} />
				: resource.action?.type === "button" ?
					<button {...commonProps} type="button" onClick={resource.action.onClick} />
				:	<button {...commonProps} type="button" />
			}
		/>
	)
}
