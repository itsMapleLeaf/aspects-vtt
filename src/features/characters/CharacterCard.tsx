import * as Lucide from "lucide-react"
import { Button } from "~/components/Button.tsx"
import { Heading } from "~/components/Heading.tsx"
import { secondaryHeading } from "~/styles/text.ts"
import type { Character } from "~/types.ts"
import { CharacterAttributeButtonRow } from "./CharacterAttributeButtonRow.tsx"
import { CharacterVitalFields } from "./CharacterVitalFields.tsx"

export function CharacterCard({ character }: { character: Character }) {
	return (
		<div className={"flex flex-col gap-3"}>
			<div className="flex items-center gap">
				<div className="size-14 overflow-clip rounded-full border border-primary-600">
					{character.imageUrl ?
						<img
							src={character.imageUrl}
							className="size-full rounded-full object-cover object-top p-px"
						/>
					:	<div className="size-full bg-primary-900">
							<Lucide.VenetianMask className="size-full scale-[0.6]" />
						</div>
					}
				</div>
				<div>
					<Heading className={secondaryHeading()}>{character.name}</Heading>
					<p>
						{[character.race, character.pronouns].filter(Boolean).join(" • ")}
					</p>
				</div>
				<Button appearance="clear" shape="circle" className="ml-auto">
					<Lucide.Edit className="size-5" />
				</Button>
			</div>
			<CharacterAttributeButtonRow />
			<CharacterVitalFields />
		</div>
	)
}
