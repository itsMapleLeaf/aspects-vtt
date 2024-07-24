import * as Lucide from "lucide-react"
import { useState } from "react"
import { CharacterImage } from "~/modules/characters/CharacterImage.tsx"
import { getCharacterDisplayName } from "~/modules/characters/helpers.ts"
import type { ApiCharacter } from "~/modules/characters/types.ts"
import { Button } from "~/ui/Button.tsx"
import { Input } from "~/ui/Input.tsx"
import { Panel } from "~/ui/Panel.tsx"
import { ScrollArea } from "~/ui/ScrollArea.tsx"

export function CharacterSearchList<T extends ApiCharacter>({
	characters,
	onSelect,
}: {
	characters: T[]
	onSelect: (character: T) => unknown
}) {
	const [search, setSearch] = useState("")
	return (
		<>
			<Input
				placeholder="Search..."
				icon={<Lucide.Search />}
				value={search}
				onChangeValue={setSearch}
			/>
			<Panel className="min-h-0 min-w-0 flex-1">
				<ScrollArea className="max-h-[420px]">
					<div className="flex flex-col">
						{characters
							.filter((character) =>
								getCharacterDisplayName(character)?.toLowerCase().includes(search.toLowerCase()),
							)
							.map((character) => (
								<Button
									key={character._id}
									icon={<CharacterImage character={character} />}
									appearance="clear"
									align="start"
									onClick={() => onSelect(character)}
								>
									{getCharacterDisplayName(character)}
								</Button>
							))}
					</div>
				</ScrollArea>
			</Panel>
		</>
	)
}
