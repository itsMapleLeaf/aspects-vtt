import type { ReactNode } from "react"
import { ReadOnlyField } from "../../ui/ReadOnlyField.tsx"
import { useCharacterUpdatePermission } from "./hooks.ts"
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
	const hasUpdatePermissions = useCharacterUpdatePermission(character)
	return hasUpdatePermissions ? children : <ReadOnlyField label={label} value={value} />
}
