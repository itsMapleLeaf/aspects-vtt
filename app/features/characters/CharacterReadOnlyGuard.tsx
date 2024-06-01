import type { ReactNode } from "react"
import { ReadOnlyField } from "../../ui/ReadOnlyField.tsx"
import type { ApiCharacter } from "./types.ts"

export function CharacterReadOnlyGuard({
	character,
	label,
	value,
	children,
}: {
	character: ApiCharacter
	label: ReactNode
	value: ReactNode
	children: React.ReactNode
}) {
	return character.isOwner ? children : <ReadOnlyField label={label} value={value} />
}
