import { useMutation, useQuery } from "convex/react"
import { startCase } from "lodash-es"
import { LucideImage, LucideUserRoundPlus, LucideUserX2 } from "lucide-react"
import { matchSorter } from "match-sorter"
import { Key, ReactNode, useState } from "react"
import { twMerge } from "tailwind-merge"
import { Button } from "~/components/Button.tsx"
import { EmptyState } from "~/components/EmptyState.tsx"
import { LoadingIcon } from "~/components/LoadingIcon.tsx"
import { api } from "~/convex/_generated/api.js"
import type { Id } from "~/convex/_generated/dataModel.js"
import { textInput } from "~/styles/input.ts"
import { NormalizedCharacter } from "../../../convex/characters.ts"
import { ensure } from "../../../shared/errors.ts"
import { Heading, HeadingLevel } from "../../components/Heading.tsx"
import { ScrollArea } from "../../components/ScrollArea.tsx"
import { useToastAction } from "../../components/ToastActionForm.tsx"
import { groupBy } from "../../lib/iterable.ts"
import { useRoomContext } from "../rooms/context.tsx"
import { useActiveSceneContext } from "../scenes/context.ts"
import { CharacterCard, CharacterEditorPopoverCard } from "./CharacterCard.tsx"
import { ApiCharacter } from "./types.ts"

export function CharacterList() {
	const room = useRoomContext()
	const scene = useActiveSceneContext()
	const characters = useQuery(api.characters.list, { roomId: room._id })
	const createCharacter = useMutation(api.characters.create)
	const updateCharacter = useMutation(api.characters.update)
	const [search, setSearch] = useState("")
	const [editingId, setEditingId] = useState<Id<"characters">>()

	type ListEditor = "sceneCharacters"

	const [listEditor, setListEditor] = useState<ListEditor>()

	const toggleListEditor = (next: ListEditor) =>
		setListEditor((current) => (current !== next ? next : undefined))

	const [, toggleInScene, toggleInScenePending] = useToastAction(
		async (_state, character: NormalizedCharacter) => {
			if (!scene) return
			await updateCharacter({
				characterId: character._id,
				sceneId: character.sceneId !== scene._id ? scene._id : null,
			})
		},
	)

	if (characters === undefined) {
		return (
			<div className="flex flex-col items-center py-8">
				<LoadingIcon />
			</div>
		)
	}

	const groups = groupBy(
		characters.filter((it) => it.sceneId == null || it.sceneId === scene?._id),
		(it) => {
			if (it.isPlayer) return "yourCharacters"
			if (it.sceneId == null) return "global"
			if (it.sceneId === scene?._id) return "currentScene"
			return "otherScenes"
		},
	)

	type ListItem = { key: Key } & (
		| { type: "heading"; text: ReactNode }
		| { type: "item"; item: ApiCharacter }
	)

	const sectionItems = (
		groupName: "yourCharacters" | "global" | "currentScene" | "otherScenes",
	): ListItem[] => {
		const group = groups.get(groupName)
		if (!group) return []

		const filteredItems = matchSorter(group, search, {
			keys: [(item) => item.identity?.name ?? [], (item) => item.race ?? ""],
		})
		if (filteredItems.length === 0) return []

		return [
			{
				key: groupName,
				type: "heading",
				text: startCase(groupName),
			},
			...filteredItems.map<ListItem>((item) => ({
				type: "item",
				item,
				key: item._id,
			})),
		]
	}

	const listItems: ListItem[] = [
		...sectionItems("yourCharacters"),
		...sectionItems("global"),
		...sectionItems("currentScene"),
		...sectionItems("otherScenes"),
	]

	const handleCreate = () => {
		createCharacter({ roomId: room._id }).then(setEditingId)
	}

	const renderListItem = (entry: ListItem) => {
		if (entry.type === "heading") {
			return (
				<Heading key={entry.key} className="-mb-1.5 text-primary-100/70">
					{entry.text}
				</Heading>
			)
		}

		if (
			listEditor === "sceneCharacters" &&
			scene &&
			entry.item.full &&
			room.isOwner
		) {
			return (
				<form
					key={entry.key}
					action={() => toggleInScene(ensure(entry.item.full))}
				>
					<button
						type="submit"
						className={twMerge(
							"w-full transition-opacity",
							toggleInScenePending ? "opacity-75" : "opacity-100",
						)}
					>
						<CharacterCard character={entry.item} />
					</button>
				</form>
			)
		}

		return (
			<CharacterEditorPopoverCard
				key={entry.key}
				character={entry.item}
				open={editingId === entry.item._id}
				setOpen={(newOpen) => {
					setEditingId(newOpen ? entry.item._id : undefined)
				}}
				afterClone={setEditingId}
			/>
		)
	}

	return (
		<div className="flex h-full min-h-0 flex-col gap-2">
			<div className="flex gap">
				<input
					className={textInput("flex-1")}
					placeholder="Search..."
					value={search}
					onChange={(event) => setSearch(event.target.value)}
				/>
				{room.isOwner && (
					<form action={handleCreate} className="contents">
						<Button
							type="submit"
							appearance="clear"
							icon={<LucideUserRoundPlus />}
						>
							<span className="sr-only">Create Character</span>
						</Button>
					</form>
				)}
			</div>

			<div className="flex gap empty:hidden">
				{room.isOwner && (
					<Button
						icon={<LucideImage />}
						appearance={listEditor === "sceneCharacters" ? "solid" : "clear"}
						onClick={() => toggleListEditor("sceneCharacters")}
					>
						Manage scene characters
					</Button>
				)}
			</div>

			{listItems.length > 0 ? (
				<ScrollArea>
					<HeadingLevel>
						<ul
							className="flex w-full min-w-0 flex-col gap data-[editing=true]:animate-pulse"
							data-editing={listEditor != null}
						>
							{listItems.map(renderListItem)}
						</ul>
					</HeadingLevel>
				</ScrollArea>
			) : (
				<EmptyState text="No characters found" icon={<LucideUserX2 />} />
			)}
		</div>
	)
}
