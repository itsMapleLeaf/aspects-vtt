import type { ComponentProps, ReactNode } from "react"
import { titleCase } from "../../common/string.ts"
import { ModalPanel, ModalProvider } from "../../ui/Modal.tsx"
import { Tabs } from "../../ui/Tabs.tsx"
import { CharacterForm } from "./CharacterForm.tsx"
import { CharacterSkillTree } from "./skills.ts"
import type { ApiCharacter } from "./types.ts"

export function CharacterModal({
	character,
	children,
	...props
}: { character: ApiCharacter; children: ReactNode } & ComponentProps<typeof ModalProvider>) {
	return (
		<ModalProvider {...props}>
			{children}
			<ModalPanel title="Character Profile" fullHeight>
				<Tabs>
					<Tabs.List>
						<Tabs.Tab>Profile</Tabs.Tab>
						<Tabs.Tab>Skills</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel className="min-h-0 flex-1 overflow-y-auto">
						<div className="p-4">
							<CharacterForm character={character} />
						</div>
					</Tabs.Panel>
					<Tabs.Panel className="-mt-1.5 flex min-h-0 flex-1 flex-col">
						<CharacterSkillsViewer character={character} />
					</Tabs.Panel>
				</Tabs>
			</ModalPanel>
		</ModalProvider>
	)
}

function CharacterSkillsViewer({ character }: { character: ApiCharacter }) {
	return (
		<Tabs>
			<Tabs.List>
				{Object.keys(CharacterSkillTree).map((name) => (
					<Tabs.Tab key={name}>{titleCase(name)}</Tabs.Tab>
				))}
			</Tabs.List>
			<div className="min-h-0 flex-1 overflow-y-auto">
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
								<ul className="grid gap-2">
									{Object.entries(tier.skills)
										.sort(([a], [b]) => a.localeCompare(b))
										.map(([skillId, skill]) => (
											<li key={skillId}>
												<h4 className="text-xl font-light">{titleCase(skillId)}</h4>
												<p className="text-primary-800">{skill.description}</p>
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
