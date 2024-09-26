import { useMutation } from "convex/react"
import { omit } from "lodash-es"
import {
	LucideCheck,
	LucideDroplets,
	LucideFlame,
	LucideMoon,
	LucideSun,
	LucideWind,
} from "lucide-react"
import { matchSorter } from "match-sorter"
import { useState } from "react"
import { twMerge } from "tailwind-merge"
import { AddButton } from "~/components/AddButton.tsx"
import { Button } from "~/components/Button.tsx"
import { ListCard } from "~/components/ListCard.tsx"
import { api } from "~/convex/_generated/api.js"
import type { NormalizedCharacter } from "~/convex/characters.ts"
import { List } from "~/shared/list.ts"
import { secondaryHeading } from "~/styles/text.ts"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/ui/tooltip.tsx"
import { SearchListLayout } from "../inventory/SearchListLayout.tsx"
import { AspectSkill, type Aspect } from "./aspects.ts"

const aspectOrder = List.of<Aspect["id"]>(
	"fire",
	"water",
	"wind",
	"light",
	"darkness",
)

const skills = AspectSkill.all()
	.sort((a, b) => a.name.localeCompare(b.name))
	.sort((a, b) => a.price - b.price)
	.sort((a, b) => a.category.localeCompare(b.category))
	.sort(
		(a, b) => aspectOrder.indexOf(a.aspectId) - aspectOrder.indexOf(b.aspectId),
	)

const totalExperience = 100

const trace = <T,>(it: T) => {
	console.log(it)
	return it
}

export function CharacterSkillsEditor({
	character,
}: {
	character: NormalizedCharacter
}) {
	const update = useMutation(api.characters.update)
	const [search, setSearch] = useState("")

	const freeSkills = AspectSkill.all().filter((it) => it.price === 0)

	const aspectSkillIds = new Set([
		...freeSkills.map((it) => it.id),
		...Object.keys(character.aspectSkills ?? {}),
	])

	const usedExperience = List.of(...aspectSkillIds)
		.map((id) => AspectSkill.get(id)?.price ?? 0)
		.sum()

	const remainingExperience = totalExperience - usedExperience

	const filteredItems = List.from(
		search.trim()
			? matchSorter(skills.array(), search, {
					keys: ["name", "description", "category", "aspectId"],
				})
			: skills,
	)

	const skillAddAction = async (skill: AspectSkill, active: boolean) => {
		await update({
			characterId: character._id,
			aspectSkills: active
				? { ...character.aspectSkills, [skill.id]: skill.id }
				: omit(character.aspectSkills, skill.id),
		})
	}

	return (
		<div className="flex h-full flex-col p-3 gap-3">
			<p className={secondaryHeading("text-center")}>
				Experience: {remainingExperience} / {totalExperience}
			</p>
			<SearchListLayout
				className="min-h-0 flex-1 p-0"
				items={filteredItems}
				itemKey="id"
				onSearch={setSearch}
				renderItem={(skill) => {
					const added = aspectSkillIds.has(skill.id)

					const hasExp = skill.price <= remainingExperience

					const hasRequired = skill.requirementIds.every((id) =>
						aspectSkillIds.has(id),
					)

					const available = hasExp && hasRequired

					return (
						<li key={skill.id} className="flex items-center gap">
							<div
								className={twMerge(
									"relative flex-1 transition",
									(added || !available) && "opacity-50",
								)}
							>
								<ListCard
									title={skill.name}
									description={skill.description}
									aside={
										<>
											{[skill.aspect.name, skill.category, skill.price + " exp"]
												.filter(Boolean)
												.join(" • ")}
											<br />
											{skill.requirements.length > 0 &&
												`requires ${new Intl.ListFormat(undefined, {
													type: "conjunction",
												}).format(skill.requirements.map((it) => it.name))}`}
										</>
									}
									className={twMerge(
										// prettier-ignore
										skill.aspectId === "fire" ? 'bg-red-950/50 border-red-900/50' :
											skill.aspectId === "water" ? 'bg-blue-950/50 border-blue-900/50' :
												skill.aspectId === "wind" ? 'bg-green-950/50 border-green-900/50' :
													skill.aspectId === "light" ? 'bg-yellow-950/50 border-yellow-900/50' :
														skill.aspectId === "darkness" ? 'bg-violet-950/25 border-violet-900/25' :
															'',
									)}
								/>
								<div
									className={twMerge(
										"absolute inset-y-0 right-0 flex w-24 items-center justify-center px-3 opacity-5",
									)}
								>
									{skill.aspectId === "fire" ? (
										<LucideFlame className="size-full" />
									) : skill.aspectId === "water" ? (
										<LucideDroplets className="size-full" />
									) : skill.aspectId === "wind" ? (
										<LucideWind className="size-full" />
									) : skill.aspectId === "light" ? (
										<LucideSun className="size-full" />
									) : skill.aspectId === "darkness" ? (
										<LucideMoon className="size-full" />
									) : null}
								</div>
							</div>
							{skill.price === 0 ? (
								<Tooltip>
									<TooltipTrigger
										render={
											<Button
												type="button"
												icon={<LucideCheck />}
												appearance="clear"
											/>
										}
									/>
									<TooltipContent>This skill cannot be removed.</TooltipContent>
								</Tooltip>
							) : (
								<AddButton
									active={skill.price === 0 || aspectSkillIds.has(skill.id)}
									activeLabel={`Add ${skill.name}`}
									inactiveLabel={`Remove ${skill.name}`}
									action={(active) => skillAddAction(skill, active)}
								/>
							)}
						</li>
					)
				}}
			/>
		</div>
	)
}
