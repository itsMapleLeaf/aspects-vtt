import { innerPanel } from "../../ui/styles.ts"
import { ApiCharacter } from "./types"

interface CharacterListCardProps {
	character: ApiCharacter
}

export function CharacterListCard({ character }: CharacterListCardProps) {
	return (
		<div className={innerPanel("flex items-center space-x-3 p-2")}>
			{character.imageUrl ?
				<img
					src={character.imageUrl}
					alt=""
					className="size-16 rounded-full bg-primary-400 object-cover object-top"
				/>
			:	<div className="size-16 rounded-full bg-primary-400" />}
			<div>
				<h3 className="font-bold">{character.name}</h3>
				<p className="text-sm text-gray-500">{character.species}</p>
			</div>
		</div>
	)
}
