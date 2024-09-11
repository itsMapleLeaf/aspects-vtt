import * as Lucide from "lucide-react"
import type { Character } from "~/types.ts"
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/avatar.tsx"
import { Button } from "~/ui/button.tsx"
import { Card, CardDescription, CardTitle } from "~/ui/card.tsx"
import { CharacterAttributeButtonRow } from "./CharacterAttributeButtonRow.tsx"
import { CharacterVitalFields } from "./CharacterVitalFields.tsx"

export function CharacterCard({ character }: { character: Character }) {
	return (
		<Card className="flex flex-col p-3 gap-3">
			<div className="flex items-center gap">
				<Avatar className="size-14">
					<AvatarImage
						src={character.imageUrl ?? undefined}
						className="object-cover object-top"
					/>
					<AvatarFallback>{character.name[0]}</AvatarFallback>
				</Avatar>
				<div>
					<CardTitle>{character.name}</CardTitle>
					<CardDescription>
						{[character.race, character.pronouns].filter(Boolean).join(" • ")}
					</CardDescription>
				</div>
				<Button variant="ghost" className="ml-auto" size="icon">
					<Lucide.Edit className="size-5" />
				</Button>
			</div>
			<CharacterVitalFields />
			<CharacterAttributeButtonRow />
		</Card>
	)
}
