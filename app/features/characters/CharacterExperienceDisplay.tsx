import { useQuery } from "convex/react"
import { twMerge } from "tailwind-merge"
import { api } from "#convex/_generated/api.js"
import { useRoom } from "../rooms/roomContext.tsx"
import type { Character } from "./types.ts"

export function CharacterExperienceDisplay({
	character,
	className,
}: {
	character: Character
	className?: string
}) {
	const room = useRoom()
	const notionData = useQuery(api.notionImports.get)

	const aspectSkillsByName = new Map(notionData?.aspectSkills.map((skill) => [skill.name, skill]))
	const aspectSkills = character.aspectSkills
		.map((name) => aspectSkillsByName.get(name))
		.filter(Boolean)

	const usedExperience = aspectSkills.reduce((total, skill) => total + skill.aspects.length * 10, 0)

	return (
		<span
			className={twMerge(
				usedExperience > room.experience && "text-red-400",
				usedExperience < room.experience && "text-green-400",
				className,
			)}
		>
			Experience: {usedExperience} / {room.experience}
		</span>
	)
}
