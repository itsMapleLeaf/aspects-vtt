import { useMutation } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import {
	LucideChevronsRight,
	LucideGraduationCap,
	LucideList,
	LucidePlus,
	LucideStar,
	LucideStars,
	LucideX,
} from "lucide-react"
import { Fragment, type ReactNode, useActionState } from "react"
import { api } from "../../../convex/_generated/api"
import { Loading } from "../../ui/Loading.tsx"
import { ScrollArea } from "../../ui/ScrollArea.tsx"
import { Tabs } from "../../ui/Tabs.tsx"
import { twc } from "../../ui/twc.ts"
import {
	type Skill,
	listAspectSkillTiers,
	listAspectSkillsByTier,
} from "../aspect-skills/data.ts"
import { type Aspect, getAspect, listAspects } from "../aspects/data.ts"
import { useRoom } from "../rooms/roomContext.tsx"
import type { ApiCharacter, OwnedApiCharacter } from "./types.ts"

export function CharacterSkillsViewer({
	character,
}: {
	character: OwnedApiCharacter
}) {
	const room = useRoom()

	const characterSkillIds = new Set(
		Iterator.from(character.learnedAspectSkills ?? []).flatMap(
			(doc) => doc.aspectSkillIds,
		),
	)

	const characterAspectSet = new Set(
		Iterator.from(character.learnedAspectSkills ?? []).map(
			(doc) => doc.aspectId,
		),
	)

	const characterAspectList = [...characterAspectSet]

	const computedSkillTree = listAspects()
		.map((aspect) => ({
			...aspect,
			tiers: listAspectSkillTiers(aspect.id).map((tier) => ({
				...tier,
				skills: listAspectSkillsByTier(aspect.id, tier.number).map((skill) => {
					// if the character already learned this aspect, calculate the cost based on the aspect index,
					// otherwise, show how much it'll cost to learn this aspect (as if it's the last aspect in the list)
					const aspectIndex = characterAspectList.indexOf(aspect.id)
					const baseAspectCost =
						(aspectIndex === -1 ? characterAspectList.length : aspectIndex) * 5
					const tierCost = tier.number * 10
					return {
						...skill,
						cost: baseAspectCost + tierCost,
						learned: characterSkillIds.has(skill.id),
					}
				}),
			})),
		}))
		.toArray()

	const usedExperience = Iterator.from(computedSkillTree)
		.flatMap((aspect) => aspect.tiers)
		.flatMap((tier) => tier.skills)
		.filter((skill) => skill.learned)
		.reduce((total, skill) => total + skill.cost, 0)

	const viewGroups = [
		computedSkillTree.map((aspect) => ({
			title: aspect.name,
			icon:
				characterAspectList[0] === aspect.id ?
					<LucideStars className="size-5" />
				: characterAspectSet.has(aspect.id) ? <LucideStar className="size-4" />
				: null,
			content: aspect.tiers.map((tier) => (
				<TierSection key={tier.name} name={tier.name} number={tier.number}>
					<SkillList skills={tier.skills} character={character} />
				</TierSection>
			)),
		})),
		[
			{
				title: "Learned",
				icon: <LucideGraduationCap className="size-5" />,
				content: computedSkillTree.map((aspect) =>
					aspect.tiers
						.map((tier) => ({
							...tier,
							skills: tier.skills.filter((skill) => skill.learned),
						}))
						.filter((tier) => tier.skills.length > 0)
						.map((tier) => (
							<TierSection
								key={tier.name}
								name={`${aspect.name}: ${tier.name}`}
								number={tier.number}
							>
								<SkillList skills={tier.skills} character={character} />
							</TierSection>
						)),
				),
			},
			{
				title: "All",
				icon: <LucideList className="size-5" />,
				content: computedSkillTree.map((aspect) =>
					aspect.tiers.map((tier) => (
						<TierSection
							key={tier.name}
							name={`${aspect.name}: ${tier.name}`}
							number={tier.number}
						>
							<SkillList skills={tier.skills} character={character} />
						</TierSection>
					)),
				),
			},
		],
	]

	return (
		<Tabs>
			<div className="flex h-full flex-col gap-2">
				<aside className="flex-center h-16 px-2 gap-1">
					<SomeKindaLabel>
						<span className="opacity-75">Experience:</span>{" "}
						{room.experience - usedExperience}{" "}
						<span className="opacity-75">remaining</span> / {room.experience}{" "}
						<span className="opacity-75">available</span>
					</SomeKindaLabel>
					{characterAspectList.length > 0 && (
						<SomeKindaLabel className="flex gap-1">
							<p className="opacity-75">Path:</p>
							<ul className="flex gap-0.5">
								{characterAspectList.map((aspect, index) => (
									<Fragment key={aspect}>
										{index > 0 && (
											<LucideChevronsRight className="size-5 translate-y-[-0.5px] stroke-[2.5px] opacity-75" />
										)}
										<span>{getAspect(aspect as Aspect["id"]).name}</span>
									</Fragment>
								))}
							</ul>
						</SomeKindaLabel>
					)}
				</aside>

				<Tabs.List className="flex flex-col">
					{viewGroups.map((group, index) => (
						<div key={index} className="flex gap-2 *:flex-1">
							{group.map((view) => (
								<Tabs.Tab
									key={view.title}
									id={view.title}
									className="flex-center-row gap-1.5"
								>
									{view.icon}
									<span>{view.title}</span>
								</Tabs.Tab>
							))}
						</div>
					))}
				</Tabs.List>

				<div className="min-h-0 flex-1">
					<ScrollArea>
						{viewGroups.flat().map((view) => (
							<Tabs.Panel
								key={view.title}
								id={view.title}
								className="grid px-2 gap-4"
							>
								{view.content}
							</Tabs.Panel>
						))}
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
}: {
	name: string
	number: number
	children: ReactNode
}) {
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
	skills: Array<Skill & { learned: boolean; cost: number }>
	character: ApiCharacter
}) {
	const setSkillActive = useMutation(api.characters.functions.setSkillActive)

	async function handleToggleSkill(
		aspectSkillId: Skill["id"],
		active: boolean,
	) {
		try {
			await setSkillActive({
				characterId: character._id,
				aspectSkillId,
				active,
			})
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
	const [, dispatchToggle, pending] = useActionState(
		() => onToggle(!active),
		undefined,
	)
	return (
		<button
			type="button"
			className="group relative w-full rounded p-2 pr-16 text-left opacity-50 transition hover:bg-primary-700/25 active:bg-primary-700/50 active:duration-0 data-[active]:opacity-100"
			data-active={active || undefined}
			onPointerDown={dispatchToggle}
		>
			<h4 className="text-xl font-light">{name}</h4>
			<p className="text-lg text-primary-200">{description}</p>
			<SomeKindaLabel className="mt-1.5 block">{cost} EXP</SomeKindaLabel>
			<div className="flex-center absolute inset-y-0 right-0 w-16 opacity-0 transition-opacity group-hover:opacity-100">
				{pending ?
					<Loading size="sm" />
				: active ?
					<LucideX />
				:	<LucidePlus />}
			</div>
		</button>
	)
}

const SomeKindaLabel = twc.span`text-sm font-bold uppercase tracking-wide text-primary-300`
