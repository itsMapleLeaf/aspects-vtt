import { useMutation } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import { LucidePlus, LucideStar, LucideStars, LucideX } from "lucide-react"
import { Fragment, type ReactNode, useActionState } from "react"
import { api } from "../../../convex/_generated/api"
import { Loading } from "../../ui/Loading.tsx"
import { Tabs } from "../../ui/Tabs.tsx"
import { twc } from "../../ui/twc.ts"
import { useRoom } from "../rooms/roomContext.tsx"
import { CharacterSkillTree } from "./skills.ts"
import type { ApiCharacter } from "./types.ts"

export function CharacterSkillsViewer({ character }: { character: ApiCharacter }) {
	const room = useRoom()

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

	const setSkillActive = useMutation(api.characters.functions.setSkillActive)

	async function handleToggleSkill(aspectSkillId: string, active: boolean) {
		try {
			await setSkillActive({ characterId: character._id, aspectSkillId, active })
		} catch (error) {
			console.error(error) // TODO: show a toast
		}
	}

	return (
		<Tabs>
			<aside className="flex-center h-12 px-2">
				<SomeKindaLabel>
					Experience: {usedExperience} <span className="opacity-75">used</span> / {room.experience}{" "}
					<span className="opacity-75">available</span>
				</SomeKindaLabel>
				<SomeKindaLabel>
					<ul className="flex gap-1.5">
						{characterAspectList.map((aspect, index) => (
							<Fragment key={aspect.id}>
								{index > 0 && <span className="translate-y-[-1px]">•</span>}
								<span>{aspect.name}</span>
							</Fragment>
						))}
					</ul>
				</SomeKindaLabel>
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

			<div className="min-h-0 flex-1 overflow-y-auto [transform:translateZ(0)]">
				{computedSkillTree.map((aspect) => (
					<Tabs.Panel key={aspect.id} className="grid gap-4 p-4">
						{aspect.tiers.map((tier) => (
							<TierSection key={tier.id} name={tier.name} number={tier.number}>
								<ul className="-m-2 grid gap-1">
									{tier.skills.map((skill) => (
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
							</TierSection>
						))}
					</Tabs.Panel>
				))}
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
			<p className="text-primary-800">{description}</p>
			<SomeKindaLabel>{cost} EXP</SomeKindaLabel>
			<div className="flex-center absolute inset-y-0 right-0 w-16 opacity-0 transition-opacity group-hover:opacity-100">
				{pending ? <Loading size="sm" /> : active ? <LucideX /> : <LucidePlus />}
			</div>
		</button>
	)
}

const SomeKindaLabel = twc.span`text-sm font-bold uppercase tracking-wide text-primary-700`
