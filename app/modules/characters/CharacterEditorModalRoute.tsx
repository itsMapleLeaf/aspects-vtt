import { useNavigate, useParams, useSearchParams } from "@remix-run/react"
import { CharacterEditor } from "~/modules/characters/CharacterEditor.tsx"
import { useCharacter } from "~/modules/rooms/roomContext.tsx"
import { ModalPanel } from "~/ui/Modal.tsx"
import type { Id } from "../../../convex/_generated/dataModel"

export function CharacterEditorModalRoute() {
	const { view } = useParams()
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const characterId = searchParams.get("id")
	const character = useCharacter(characterId as Id<"characters"> | null)
	return (
		<ModalPanel
			title={character?.permission === "full" ? `${character.name}'s Profile` : "Character Profile"}
			className="max-w-screen-sm"
			fullHeight
			unmountOnHide={false}
			open={view === "character"}
			onClose={() => navigate("..")}
		>
			{character && <CharacterEditor character={character} />}
		</ModalPanel>
	)
}
