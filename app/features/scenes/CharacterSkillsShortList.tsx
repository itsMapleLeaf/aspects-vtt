import { Tooltip, TooltipAnchor, TooltipProvider } from "@ariakit/react"
import { panel, translucentPanel } from "../../ui/styles.ts"
import type { ApiCharacter } from "../characters/types.ts"
import { useCharacterAbilities } from "../characters/useCharacterAbilities.ts"

export function CharacterSkillsShortList({
	character,
}: {
	character: ApiCharacter
}) {
	const skills = useCharacterAbilities(character)
	return (
		<ul className="flex flex-wrap gap-2">
			{skills.map((skill) => (
				<TooltipProvider key={skill.name} timeout={250} placement="top">
					<TooltipAnchor
						render={<li />}
						className={panel(
							"cursor-default bg-primary-200/50 p-2 font-light leading-none transition hover:bg-primary-200",
						)}
					>
						{skill.name}
					</TooltipAnchor>
					<Tooltip
						className={translucentPanel(
							"pointer-events-none max-w-xs translate-y-1 whitespace-pre-line p-2 opacity-0 shadow-md shadow-black/50 transition data-[enter]:translate-y-0 data-[enter]:opacity-100",
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
			{skills.length === 0 && (
				<p className="italic opacity-75">This character has no skills.</p>
			)}
		</ul>
	)
}
