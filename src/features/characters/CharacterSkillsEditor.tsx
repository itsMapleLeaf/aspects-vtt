import { AspectSkill } from "./aspects.ts"

export function CharacterSkillsEditor() {
	return (
		<ul>
			{AspectSkill.all().map((skill) => (
				<li key={skill.id}>{skill.name}</li>
			))}
		</ul>
	)
}
