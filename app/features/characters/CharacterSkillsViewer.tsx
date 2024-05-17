import { useMutation, useQuery } from "convex/react"
import { LucidePlus, LucideX } from "lucide-react"
import { type ReactNode, useActionState } from "react"
import { api } from "../../../convex/_generated/api"
import type { Branded } from "../../../convex/helpers/convex.ts"
import { keyedByProperty } from "../../common/collection.ts"
import { Loading } from "../../ui/Loading.tsx"
import { Tabs } from "../../ui/Tabs.tsx"
import { CharacterSkillTree } from "./skills.ts"
import type { ApiCharacter } from "./types.ts"

export function CharacterSkillsViewer({ character }: { character: ApiCharacter }) {
	const characterSkills =
		useQuery(api.characterAspectSkills.functions.list, {
			characterId: character._id,
		}) ?? []
	const characterSkillsBySkillId = keyedByProperty(characterSkills, "aspectSkillId")

	const create = useMutation(api.characterAspectSkills.functions.create)
	const remove = useMutation(api.characterAspectSkills.functions.remove)

	async function toggleAspectSkill(skillId: string) {
		try {
			const existing = characterSkillsBySkillId.get(skillId as Branded<"aspectSkill">)
			if (existing) {
				await remove({ characterAspectSkillId: existing._id })
			} else {
				await create({
					characterId: character._id,
					aspectSkillId: skillId as Branded<"aspectSkill">,
				})
			}
		} catch (error) {
			console.error(error) // TODO: show a toast
		}
	}

	return (
		<Tabs>
			<Tabs.List>
				{CharacterSkillTree.aspects.map((aspect) => (
					<Tabs.Tab key={aspect.id}>{aspect.name}</Tabs.Tab>
				))}
			</Tabs.List>
			<div className="min-h-0 flex-1 overflow-y-auto [transform:translateZ(0)]">
				{CharacterSkillTree.aspects.map((aspect) => (
					<Tabs.Panel key={aspect.id} className="grid gap-4 p-4">
						{aspect.tiers.map((tier) => (
							<TierSection key={tier.id} name={tier.name} number={tier.number}>
								<ul className="-m-2 grid gap-1">
									{tier.skills.map((skill) => (
										<li key={skill.id}>
											<AspectSkillButton
												name={skill.name}
												description={skill.description}
												active={characterSkillsBySkillId.has(skill.id)}
												onToggle={() => toggleAspectSkill(skill.id)}
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
	onToggle,
}: {
	name: string
	description: string
	active: boolean
	onToggle: () => unknown
}) {
	const [, dispatchToggle, pending] = useActionState(onToggle, undefined)
	return (
		<button
			type="button"
			className="group relative w-full rounded p-2 pr-16 text-left opacity-50 transition hover:bg-primary-300/25 active:bg-primary-300/50 active:duration-0 data-[active]:opacity-100"
			data-active={active || undefined}
			onPointerDown={dispatchToggle}
		>
			<h4 className="text-xl font-light">{name}</h4>
			<p className="text-primary-800">{description}</p>
			<div className="flex-center absolute inset-y-0 right-0 w-16 opacity-0 transition-opacity group-hover:opacity-100">
				{pending ? <Loading size="sm" /> : active ? <LucideX /> : <LucidePlus />}
			</div>
		</button>
	)
}
