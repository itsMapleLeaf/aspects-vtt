import * as React from "react"
import { Observable, useObservable } from "#app/common/observable.js"
import type { ApiCharacter } from "../characters/types.ts"
import { useCharacters } from "./roomContext.tsx"

export class RoomStore {
	currentCharacterId = Observable.empty<ApiCharacter["_id"]>()
}

export const RoomStoreContext = React.createContext(new RoomStore())

export function useCurrentCharacter() {
	const store = React.useContext(RoomStoreContext)
	const characters = useCharacters()
	const currentCharacterId = useObservable(store.currentCharacterId)
	return characters.find((c) => c._id === currentCharacterId)
}
