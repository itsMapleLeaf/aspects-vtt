import { useParams } from "@remix-run/react"
import type { FunctionReturnType } from "convex/server"
import { $params } from "remix-routes"
import type { Nullish } from "../../../common/types.ts"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel.js"
import { useQuerySuspense } from "../convex/suspense.ts"

export type ApiRoom = NonNullable<FunctionReturnType<typeof api.rooms.functions.get>>

export function RoomOwnerOnly({ children }: { children: React.ReactNode }) {
	const room = useRoom()
	return room.isOwner && children
}

export function useRoom() {
	const params = $params("/rooms/:slug", useParams())
	const room = useQuerySuspense(api.rooms.functions.get, { slug: params.slug })
	if (!room) {
		throw new Response("Room not found", { status: 404 })
	}
	return room
}

export function useCharacters() {
	const room = useRoom()
	return useQuerySuspense(api.characters.functions.list, { roomId: room._id })
}

export function useCharacter(id: Nullish<Id<"characters">>) {
	const characters = useCharacters()
	return characters.find((c) => c._id === id)
}
