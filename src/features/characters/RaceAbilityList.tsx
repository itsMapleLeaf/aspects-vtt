import { ListCard } from "../../components/ListCard.tsx"
import { RACES } from "./races.ts"

export function RaceAbilityList({ race }: { race: string }) {
	const abilities = [...new Set(RACES[race.toLowerCase()]?.abilities)]
	return abilities.length > 0 ? (
		<ul className="flex flex-col gap-2">
			{abilities
				.map((line) => line.split(" - "))
				.flatMap(([name, ...rest]) =>
					name ? [{ name, description: rest.join(" - ") }] : [],
				)
				.map(({ name, description }) => (
					<li key={name}>
						<ListCard
							title={<span className="text-lg">{name}</span>}
							description={<span>{description}</span>}
						/>
					</li>
				))}
		</ul>
	) : (
		<p className="opacity-70">No abilities found.</p>
	)
}
