import type { LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { useEffect } from "react"
import { $params, $path } from "remix-routes"
import { CharacterForm } from "#app/features/characters/CharacterForm.tsx"
import { CharacterSelect } from "#app/features/characters/CharacterSelect.tsx"
import { CreateCharacterButton } from "#app/features/characters/CreateCharacterButton.tsx"
import { DeleteCharacterButton } from "#app/features/characters/DeleteCharacterButton.tsx"
import { useCurrentCharacterId } from "#app/features/characters/useCurrentCharacterId.ts"
import { DiceRollForm } from "#app/features/dice/DiceRollForm.tsx"
import { DiceRollList } from "#app/features/dice/DiceRollList.tsx"
import { useRoom } from "#app/features/rooms/useRoom.js"
import { TokenMap } from "#app/features/tokens/TokenMap.js"
import { getPreferences } from "#app/preferences.server.ts"
import { Button } from "#app/ui/Button.tsx"
import { Loading } from "#app/ui/Loading.tsx"
import { api } from "#convex/_generated/api.js"

export async function loader({ request, params }: LoaderFunctionArgs) {
	const { roomSlug } = $params("/rooms/:roomSlug", params)
	const preferences = await getPreferences(request)
	return preferences.username
		? json({ username: preferences.username })
		: redirect($path("/rooms/:roomSlug/setup", { roomSlug }))
}

export const shouldRevalidate = () => false

export default function RoomIndexRoute() {
	const { username } = useLoaderData<typeof loader>()
	const room = useRoom()
	const characters = useQuery(api.characters.list, { roomId: room._id })
	const [currentCharacterId, setCurrentCharacterId] = useCurrentCharacterId()
	const firstCharacter = characters?.[0]
	const character = characters?.find((c) => c._id === currentCharacterId) ?? firstCharacter

	useEffect(() => {
		if (!character?._id && firstCharacter?._id) {
			setCurrentCharacterId(firstCharacter._id)
		}
	}, [character?._id, firstCharacter?._id, setCurrentCharacterId])

	return (
		<div className="flex h-dvh flex-col gap-2 bg-primary-100 p-2">
			<header className="flex justify-end gap-[inherit]">
				<Button icon={<Lucide.DoorOpen />} text="Leave" element={<Link to={$path("/")} />} />
				<Button
					element={
						<Link to={$path("/rooms/:roomSlug/setup", { roomSlug: room.slug }, { username })} />
					}
					icon={<Lucide.Edit />}
					text={username}
				/>
			</header>
			<main className="flex min-h-0 flex-1 gap-2">
				<div className="flex h-full max-w-[360px] flex-1 flex-col gap-2">
					<DiceRollForm username={username} />
					<div className="min-h-0 flex-1">
						<DiceRollList />
					</div>
				</div>
				<div className="flex min-w-0 flex-1">
					<TokenMap />
				</div>
				{characters !== undefined ? (
					<div className="flex max-w-[360px] flex-1 flex-col gap-2">
						<div className="flex gap-2">
							<div className="flex-1">
								<CharacterSelect characters={characters} />
							</div>
							{character && <DeleteCharacterButton character={character} />}
							<CreateCharacterButton username={username} />
						</div>
						{character && (
							<div className="min-h-0 flex-1">
								<CharacterForm character={character} />
							</div>
						)}
					</div>
				) : (
					<div className="flex max-w-[360px] flex-1 flex-col items-center justify-center">
						<Loading />
					</div>
				)}
			</main>
		</div>
	)
}
