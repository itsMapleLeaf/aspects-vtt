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

	// core skills are the first two character's starter skills matching _only_ the character's core aspect,
	// and don't count towards the character's experience
	const { coreAspect } = character
	const coreAspectSkills = new Set(
		coreAspect ?
			aspectSkills
				.filter((skill) => skill.aspects.length === 1 && skill.aspects.includes(coreAspect))
				.slice(0, 2)
		:	[],
	)

	const usedExperience = aspectSkills
		.filter((skill) => !coreAspectSkills.has(skill))
		.reduce((total, skill) => total + skill.aspects.length * 10, 0)

	return (
		<span
			className={twMerge(
				usedExperience > room.experience && "text-red-400",
				usedExperience < room.experience && "text-green-400",
				className,
			)}
		>
			Experience: {room.experience - usedExperience} / {room.experience}
		</span>
	)
}
