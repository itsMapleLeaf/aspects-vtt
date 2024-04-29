import { Link } from "@remix-run/react"
import { useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import * as Lucide from "lucide-react"
import { createContext } from "react"
import { $path } from "remix-routes"
import { empty, useNonEmptyContext } from "#app/common/context.tsx"
import { Button } from "#app/ui/Button.js"
import { Loading } from "#app/ui/Loading.js"
import { api } from "#convex/_generated/api.js"
import type { Id } from "#convex/_generated/dataModel.js"
import type { ApiCharacter } from "../characters/types.ts"

export type ApiRoom = NonNullable<FunctionReturnType<typeof api.rooms.get>["value"]>

const RoomContext = createContext<ApiRoom | typeof empty>(empty)
const CharacterContext = createContext<ApiCharacter[] | typeof empty>(empty)

export function RoomProvider({
	slug,
	children,
}: {
	slug: string
	children: React.ReactNode
}) {
	const room = useQuery(api.rooms.get, { slug })
	const characters = useQuery(api.characters.list, { roomId: slug })

	return room === undefined || characters === undefined ? (
		<div className="flex h-dvh flex-col items-center justify-center">
			<Loading />
		</div>
	) : room.ok ? (
		<RoomContext.Provider value={room.value}>
			<CharacterContext.Provider value={characters}>{children}</CharacterContext.Provider>
		</RoomContext.Provider>
	) : (
		<main className="flex flex-col gap-4">
			<p>{room.error}</p>
			<Button
				text="Return to home"
				icon={<Lucide.DoorOpen />}
				element={<Link to={$path("/")} />}
				className="self-start"
			/>
		</main>
	)
}

export function RoomOwnerOnly({ children }: { children: React.ReactNode }) {
	const room = useRoom()
	return room.isOwner && children
}

export function useRoom() {
	return useNonEmptyContext(RoomContext)
}

export function useCharacters() {
	return useNonEmptyContext(CharacterContext)
}

export function useCharacter(id: Id<"characters">) {
	const characters = useCharacters()
	return characters.find((c) => c._id === id)
}
