import { LucidePlus, LucideX } from "lucide-react"
import { useState } from "react"
import { titleCase } from "../../common/string.ts"
import { Tabs } from "../../ui/Tabs.tsx"
import { CharacterSkillTree, type SkillTreeSkill } from "./skills.ts"
import type { ApiCharacter } from "./types.ts"

export function CharacterSkillsViewer({ character }: { character: ApiCharacter }) {
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
							<section key={tierId} className="grid gap-3">
								<h3 className="text-3xl/tight font-light">
									<div>{titleCase(tierId)}</div>
									<div className="text-sm font-bold uppercase tracking-wide text-primary-700">
										Tier {tierIndex + 1}
									</div>
								</h3>
								<ul className="-m-2 grid gap-1">
									{Object.entries(tier.skills)
										.sort(([a], [b]) => a.localeCompare(b))
										.map(([skillId, skill]) => (
											<li key={skillId}>
												<AspectSkillButton skillId={skillId} skill={skill} character={character} />
											</li>
										))}
								</ul>
							</section>
						))}
					</Tabs.Panel>
				))}
			</div>
		</Tabs>
	)
}

function AspectSkillButton({
	skillId,
	skill,
	character,
}: { skillId: string; skill: SkillTreeSkill; character: ApiCharacter }) {
	const [isActive, setIsActive] = useState(false)
	const handleClick = () => setIsActive(!isActive)

	return (
		<button
			type="button"
			className="group grid w-full grid-cols-[1fr,auto] items-center gap-x-3 rounded p-2 text-left opacity-50 transition hover:bg-primary-300/25 active:bg-primary-300/50 active:duration-0 data-[active]:opacity-100"
			data-active={isActive || undefined}
			onClick={handleClick}
		>
			<h4 className="text-xl font-light">{titleCase(skillId)}</h4>
			<p className="col-start-1 text-primary-800">{skill.description}</p>
			<div className="col-[2/3] row-[1/3] opacity-0 transition-opacity group-hover:opacity-100">
				{isActive ? <LucideX /> : <LucidePlus />}
			</div>
		</button>
	)
}
