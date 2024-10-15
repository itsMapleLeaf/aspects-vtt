import { RACES } from "./races.ts"

export function RacesTable() {
	return (
		<table>
			<thead>
				<tr>
					<th>Race</th>
					<th>Traits</th>
					<th>Abilities</th>
				</tr>
			</thead>
			<tbody>
				{Object.values(RACES).map((race) => (
					<tr key={race.id}>
						<td>{race.name}</td>
						<td>{race.traits}</td>
						<td>
							<ul>
								{race.abilities.map((ability, index) => (
									<li key={index}>{ability}</li>
								))}
							</ul>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	)
}
