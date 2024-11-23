import { useMutation, useQuery } from "convex/react"
import { startCase } from "es-toolkit"
import { LucideImage, LucideUserRoundPlus, LucideUserX2 } from "lucide-react"
import { matchSorter } from "match-sorter"
import { Key, ReactNode, useState } from "react"
import { twMerge } from "tailwind-merge"
import { Simplify } from "type-fest"
import { Button } from "~/components/Button.tsx"
import { EmptyState } from "~/components/EmptyState.tsx"
import { LoadingIcon } from "~/components/LoadingIcon.tsx"
import { api } from "~/convex/_generated/api.js"
import { groupBy } from "~/lib/iterable.ts"
import { textInput } from "~/styles/input.ts"
import { NormalizedCharacter } from "../../../convex/characters.ts"
import { ensure } from "../../../lib/errors.ts"
import { Heading, HeadingLevel } from "../../components/Heading.tsx"
import { ScrollArea } from "../../components/ScrollArea.tsx"
import { useToastAction } from "../../components/ToastActionForm.tsx"
import { useRoomContext } from "../rooms/context.tsx"
import { useActiveSceneContext } from "../scenes/context.ts"
import { CharacterCard } from "./CharacterCard.tsx"
import { useCharacterEditorDialog } from "./CharacterEditorDialog.tsx"
import { ApiCharacter } from "./types.ts"

export function CharacterList() {
	const room = useRoomContext()
	const scene = useActiveSceneContext()
	const characters = useQuery(api.characters.listByRoomScene, {
		roomId: room._id,
		sceneId: scene?._id ?? null,
	})
	const createCharacter = useMutation(api.characters.create)
	const updateCharacter = useMutation(api.characters.update)
	const [search, setSearch] = useState("")
	const editor = useCharacterEditorDialog()

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

	const groups = groupBy(characters, (it) => {
		if (it.isPlayer) return "yourCharacters"
		if (it.playerId != null) return "players"
		if (it.sceneId == null) return "global"
		if (it.sceneId === scene?._id) return "currentScene"
		return "otherScenes"
	})

	type ListItem = Simplify<
		{ key: Key } & (
			| { type: "heading"; text: ReactNode }
			| { type: "item"; item: ApiCharacter }
		)
	>

	const sectionItems = (
		groupName:
			| "yourCharacters"
			| "players"
			| "global"
			| "currentScene"
			| "otherScenes",
	): ListItem[] => {
		const group = groups.get(groupName)
		if (!group) return []

		const filteredItems = matchSorter(group, search, {
			keys: [(item) => item.name ?? "", (item) => item.race ?? ""],
			sorter: (items) =>
				items.sort((a, b) =>
					(a.item.name ?? "").localeCompare(b.item.name ?? ""),
				),
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
		...sectionItems("players"),
		...sectionItems("global"),
		...sectionItems("currentScene"),
		...sectionItems("otherScenes"),
	]

	const handleCreate = () => {
		createCharacter({ roomId: room._id }).then(editor.show)
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
							"w-full transition-opacity *:select-none",
							toggleInScenePending ? "opacity-75" : "opacity-100",
						)}
					>
						<CharacterCard character={entry.item} />
					</button>
				</form>
			)
		}

		return (
			<button
				key={entry.key}
				type="button"
				className="contents *:select-none"
				onClick={() => {
					editor.show(entry.item._id)
				}}
			>
				<CharacterCard key={entry.key} character={entry.item} />
			</button>
		)
	}

	return (
		<div className="flex h-full min-h-0 flex-col gap-2">
			{editor.element}

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
