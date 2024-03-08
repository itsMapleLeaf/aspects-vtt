import { useParams } from "@remix-run/react"
import { api } from "convex-backend/_generated/api.js"
import { useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { useEffect } from "react"
import { $params } from "remix-routes"
import { useCurrentCharacterId } from "~/features/characters/useCurrentCharacterId"
import { Loading } from "~/ui/Loading.tsx"
import { Select } from "~/ui/Select"

export function CharacterSelect() {
	const { roomSlug } = $params("/rooms/:roomSlug", useParams())
	const characters = useQuery(api.characters.list, { roomSlug })
	const [currentCharacterId, setCurrentCharacterId] = useCurrentCharacterId()
	const firstCharacterId = characters?.[0]?._id

	useEffect(() => {
		if (!currentCharacterId && firstCharacterId) {
			setCurrentCharacterId(firstCharacterId)
		}
	}, [currentCharacterId, firstCharacterId, setCurrentCharacterId])

	return (
		characters === undefined ? <Loading />
		: characters.length === 0 ?
			<p className="flex h-10 flex-row items-center px-2 opacity-60">No characters found.</p>
		:	<div className="relative flex flex-row items-center">
				<Select
					options={characters.map((character) => ({ value: character._id, label: character.name }))}
					value={currentCharacterId}
					onChange={setCurrentCharacterId}
				/>
				<Lucide.ChevronsUpDown className="pointer-events-none absolute left-2" />
			</div>
	)
}
