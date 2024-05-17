import { useMutation, useQuery } from "convex/react"
import { LucidePlus, LucideX } from "lucide-react"
import { type ReactNode, useActionState } from "react"
import { api } from "../../../convex/_generated/api"
import type { Branded } from "../../../convex/helpers/convex.ts"
import { keyedByProperty } from "../../common/collection.ts"
import { titleCase } from "../../common/string.ts"
import { Loading } from "../../ui/Loading.tsx"
import { Tabs } from "../../ui/Tabs.tsx"
import { CharacterSkillTree } from "./skills.ts"
import type { ApiCharacter } from "./types.ts"

export function CharacterSkillsViewer({ character }: { character: ApiCharacter }) {
	const characterSkills =
		useQuery(api.characterAspectSkills.functions.list, {
			characterId: character._id,
		}) ?? []
	const characterSkillIds = keyedByProperty(characterSkills, "aspectSkillId")

	const create = useMutation(api.characterAspectSkills.functions.create)
	const remove = useMutation(api.characterAspectSkills.functions.remove)

	async function toggleAspectSkill(skillId: string) {
		const existing = characterSkillIds.get(skillId as Branded<"aspectSkill">)
		if (existing) {
			await remove({ characterAspectSkillId: existing._id })
		} else {
			await create({
				characterId: character._id,
				aspectSkillId: skillId as Branded<"aspectSkill">,
			})
		}
	}

	return (
		<Tabs>
			<Tabs.List>
				{Object.keys(CharacterSkillTree).map((name) => (
					<Tabs.Tab key={name}>{titleCase(name)}</Tabs.Tab>
				))}
			</Tabs.List>
			<div className="min-h-0 flex-1 overflow-y-auto [transform:translateZ(0)]">
				{Object.entries(CharacterSkillTree).map(([aspectId, aspect]) => (
					<Tabs.Panel key={aspectId} className="grid gap-4 p-4">
						{Object.entries(aspect.tiers).map(([tierId, tier], tierIndex) => (
							<TierSection key={tierId} name={titleCase(tierId)} number={tierIndex + 1}>
								<ul className="-m-2 grid gap-1">
									{Object.entries(tier.skills).map(([skillId, skill]) => (
										<li key={skillId}>
											<AspectSkillButton
												name={titleCase(skillId)}
												description={skill.description}
												active={characterSkillIds.has(skillId)}
												onClick={() => toggleAspectSkill(skillId)}
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
			<h3 className="text-3xl/tight font-light">
				<div>{name}</div>
				<div className="text-sm font-bold uppercase tracking-wide text-primary-700">
					Tier {number}
				</div>
			</h3>
			{children}
		</section>
	)
}

function AspectSkillButton({
	name,
	description,
	active,
	onClick,
}: {
	name: string
	description: string
	active: boolean
	onClick: () => unknown
}) {
	const [, handleClick, pending] = useActionState(onClick, undefined)
	return (
		<button
			type="button"
			className="group relative w-full rounded p-2 pr-12 text-left opacity-50 transition hover:bg-primary-300/25 active:bg-primary-300/50 active:duration-0 data-[active]:opacity-100"
			data-active={active || undefined}
			onClick={handleClick}
		>
			<h4 className="text-xl font-light">{name}</h4>
			<p className="text-primary-800">{description}</p>
			<div className="flex-center absolute inset-y-0 right-0 w-12 opacity-0 transition-opacity group-hover:opacity-100">
				{pending ? <Loading size="sm" /> : active ? <LucideX /> : <LucidePlus />}
			</div>
		</button>
	)
}
