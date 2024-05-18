import { Tooltip, TooltipAnchor, TooltipProvider } from "@ariakit/react"
import { panel, translucentPanel } from "../../ui/styles.ts"
import type { ApiCharacter } from "../characters/types.ts"
import { useCharacterAbilities } from "../characters/useCharacterAbilities.ts"

export function CharacterSkillsShortList({ character }: { character: ApiCharacter }) {
	const skills = useCharacterAbilities(character)
	return (
		<ul className="flex flex-wrap gap-2">
			{skills.map((skill) => (
				<TooltipProvider key={skill.name} timeout={250} placement="top">
					<TooltipAnchor
						render={<li />}
						className={panel(
							"leading-none font-light bg-primary-200/50 hover:bg-primary-200 cursor-default transition p-2",
						)}
					>
						{skill.name}
					</TooltipAnchor>
					<Tooltip
						className={translucentPanel(
							"p-2 max-w-xs opacity-0 translate-y-1 transition data-[enter]:opacity-100 data-[enter]:translate-y-0 shadow-md shadow-black/50 whitespace-pre-line pointer-events-none",
						)}
						wrapperProps={{
							className: "pointer-events-none",
						}}
						unmountOnHide
						gutter={12}
						portal
						disablePointerEventsOnApproach={false}
					>
						{skill.description}
					</Tooltip>
				</TooltipProvider>
			))}
			{skills.length === 0 && <p className="italic opacity-75">This character has no skills.</p>}
		</ul>
	)
}
