export function CharacterName({
	character,
}: {
	character: { name: string | null | undefined } | null | undefined
}) {
	const name = resolveCharacterName(character?.name)
	return <span className={name.isKnown ? "" : "opacity-70"}>{name.text}</span>
}

export function resolveCharacterName(name: string | null | undefined) {
	name = name?.trim()

	const state =
		name == null
			? ("unknown" as const)
			: name.length === 0
				? ("missing" as const)
				: ("known" as const)

	return {
		state,
		isKnown: state === "known",
		text: name == null ? "(unknown)" : name.length === 0 ? "(unnamed)" : name,
	}
}
