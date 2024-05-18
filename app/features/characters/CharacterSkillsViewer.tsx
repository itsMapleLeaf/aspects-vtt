import { useMutation } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import {
	LucideChevronsRight,
	LucideHelpCircle,
	LucidePlus,
	LucideStar,
	LucideStars,
	LucideX,
} from "lucide-react"
import { Fragment, type ReactNode, useActionState, useState } from "react"
import { api } from "../../../convex/_generated/api"
import { CheckboxField } from "../../ui/CheckboxField.tsx"
import { EmptyState } from "../../ui/EmptyState.tsx"
import { Loading } from "../../ui/Loading.tsx"
import { ScrollArea } from "../../ui/ScrollArea.tsx"
import { Tabs } from "../../ui/Tabs.tsx"
import { twc } from "../../ui/twc.ts"
import { useRoom } from "../rooms/roomContext.tsx"
import { CharacterSkillTree, type Skill } from "./skills.ts"
import type { ApiCharacter } from "./types.ts"

export function CharacterSkillsViewer({ character }: { character: ApiCharacter }) {
	const room = useRoom()
	const [showingLearned, setShowingLearned] = useState(false)

	const characterSkillIds = new Set(
		Iterator.from(character.learnedAspectSkills ?? []).flatMap((doc) => doc.aspectSkillIds),
	)

	const characterAspectSet = new Set(
		Iterator.from(character.learnedAspectSkills ?? [])
			.map((doc) => CharacterSkillTree.aspectsById.get(doc.aspectId))
			.filter((aspect) => aspect != null),
	)

	const characterAspectList = [...characterAspectSet]

	const computedSkillTree = CharacterSkillTree.aspects.map((aspect) => ({
		...aspect,
		tiers: aspect.tiers.map((tier) => ({
			...tier,
			skills: tier.skills.map((skill) => {
				// if the character already learned this aspect, calculate the cost based on the aspect index,
				// otherwise, show how much it'll cost to learn this aspect (as if it's the last aspect in the list)
				const aspectIndex = characterAspectList.indexOf(aspect)
				const baseAspectCost = (aspectIndex === -1 ? characterAspectList.length : aspectIndex) * 5
				const tierCost = tier.number * 10
				return {
					...skill,
					cost: baseAspectCost + tierCost,
					learned: characterSkillIds.has(skill.id),
				}
			}),
		})),
	}))

	const usedExperience = Iterator.from(computedSkillTree)
		.flatMap((aspect) => aspect.tiers)
		.flatMap((tier) => tier.skills)
		.filter((skill) => skill.learned)
		.reduce((total, skill) => total + skill.cost, 0)

	return (
		<Tabs>
			<div className="flex h-full flex-col gap-2">
				<aside className="flex-center h-16 gap-1 px-2">
					<SomeKindaLabel>
						<span className="opacity-75">Experience:</span> {room.experience - usedExperience}{" "}
						<span className="opacity-75">remaining</span> / {room.experience}{" "}
						<span className="opacity-75">available</span>
					</SomeKindaLabel>
					{characterAspectList.length > 0 && (
						<SomeKindaLabel className="flex gap-1">
							<p className="opacity-75">Path:</p>
							<ul className="flex gap-0.5">
								{characterAspectList.map((aspect, index) => (
									<Fragment key={aspect.id}>
										{index > 0 && (
											<LucideChevronsRight className="size-5 translate-y-[-0.5px] stroke-[2.5px] opacity-75" />
										)}
										<span>{aspect.name}</span>
									</Fragment>
								))}
							</ul>
						</SomeKindaLabel>
					)}
				</aside>

				<Tabs.List>
					{CharacterSkillTree.aspects.map((aspect) => (
						<Tabs.Tab key={aspect.id} className="flex-center-row gap-1.5">
							{characterAspectList[0] === aspect ? (
								<LucideStars className="size-5" />
							) : characterAspectSet.has(aspect) ? (
								<LucideStar className="size-4" />
							) : null}
							<span>{aspect.name}</span>
						</Tabs.Tab>
					))}
				</Tabs.List>

				<section aria-label="Filters" className="flex-center-row p-2">
					<CheckboxField
						label="Only show learned skills"
						checked={showingLearned}
						onChange={(event) => setShowingLearned(event.target.checked)}
					/>
				</section>

				<div className="min-h-0 flex-1">
					<ScrollArea>
						{computedSkillTree.map((aspect) => {
							const tierItems = Iterator.from(aspect.tiers)
								.map((tier) => {
									return showingLearned
										? { ...tier, skills: tier.skills.filter((s) => s.learned) }
										: tier
								})
								.filter((tier) => tier.skills.length > 0)
								.map((tier) => (
									<TierSection key={tier.id} name={tier.name} number={tier.number}>
										<SkillList skills={tier.skills} character={character} />
									</TierSection>
								))
								.toArray()

							return (
								<Tabs.Panel key={aspect.id} className="grid gap-4 px-2">
									{tierItems.length > 0 ? (
										tierItems
									) : (
										<EmptyState
											icon={<LucideHelpCircle />}
											message="Nothing here."
											className="py-24"
										/>
									)}
								</Tabs.Panel>
							)
						})}
					</ScrollArea>
				</div>
			</div>
		</Tabs>
	)
}

function TierSection({
	name,
	number,
	children,
}: { name: string; number: number; children: ReactNode }) {
	return (
		<section className="grid gap-3">
			<h3>
				<div className="text-3xl/tight font-light">{name}</div>
				<SomeKindaLabel>Tier {number}</SomeKindaLabel>
			</h3>
			{children}
		</section>
	)
}

function SkillList({
	skills,
	character,
}: {
	skills: (Skill & { learned: boolean; cost: number })[]
	character: ApiCharacter
}) {
	const setSkillActive = useMutation(api.characters.functions.setSkillActive)

	async function handleToggleSkill(aspectSkillId: string, active: boolean) {
		try {
			await setSkillActive({ characterId: character._id, aspectSkillId, active })
		} catch (error) {
			console.error(error) // TODO: show a toast
		}
	}

	return (
		<ul className="-m-2 grid gap-1">
			{skills.map((skill) => (
				<li key={skill.id}>
					<AspectSkillButton
						name={skill.name}
						description={skill.description}
						active={skill.learned}
						cost={skill.cost}
						onToggle={() => handleToggleSkill(skill.id, !skill.learned)}
					/>
				</li>
			))}
		</ul>
	)
}

function AspectSkillButton({
	name,
	description,
	active,
	cost,
	onToggle,
}: {
	name: string
	description: string
	active: boolean
	cost: number
	onToggle: (active: boolean) => unknown
}) {
	const [, dispatchToggle, pending] = useActionState(() => onToggle(!active), undefined)
	return (
		<button
			type="button"
			className="group relative w-full rounded p-2 pr-16 text-left opacity-50 transition hover:bg-primary-300/25 active:bg-primary-300/50 active:duration-0 data-[active]:opacity-100"
			data-active={active || undefined}
			onPointerDown={dispatchToggle}
		>
			<h4 className="text-xl font-light">{name}</h4>
			<p className="text-lg text-primary-800">{description}</p>
			<SomeKindaLabel className="mt-1.5 block">{cost} EXP</SomeKindaLabel>
			<div className="flex-center absolute inset-y-0 right-0 w-16 opacity-0 transition-opacity group-hover:opacity-100">
				{pending ? <Loading size="sm" /> : active ? <LucideX /> : <LucidePlus />}
			</div>
		</button>
	)
}

const SomeKindaLabel = twc.span`text-sm font-bold uppercase tracking-wide text-primary-700`
