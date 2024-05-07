import { useQuery } from "convex/react"
import { twMerge } from "tailwind-merge"
import { api } from "../../../convex/_generated/api.js"
import type { Doc } from "../../../convex/_generated/dataModel.js"
import { useRoom } from "../rooms/roomContext.tsx"
import type { ApiCharacter } from "./types.ts"

type ApiAspectSkill = Doc<"notionImports">["aspectSkills"][number]

export function CharacterExperienceDisplay({
	character,
	className,
}: {
	character: ApiCharacter
	className?: string
}) {
	const room = useRoom()
	const notionData = useQuery(api.notionImports.functions.get)

	const aspectSkillsByName = new Map(notionData?.aspectSkills.map((skill) => [skill.name, skill]))

	const addedAspectSkills = new Set(
		character.aspectSkills.filter((skill) => aspectSkillsByName.has(skill)),
	)

	const getCost = (skill: ApiAspectSkill, index: number) =>
		index <= 1 ? 0 : skill.aspects.length * 10 + Math.max(0, index - 2) * 5

	const usedExperience = [...addedAspectSkills.values()]
		.map((name) => aspectSkillsByName.get(name))
		.filter(Boolean)
		.reduce((total, skill, index) => total + getCost(skill, index), 0)

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
