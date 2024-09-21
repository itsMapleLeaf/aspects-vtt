import * as Lucide from "lucide-react"
import { Avatar } from "~/components/Avatar.tsx"
import { Button } from "~/components/Button.tsx"
import { Heading } from "~/components/Heading.tsx"
import { secondaryHeading } from "~/styles/text.ts"
import { CharacterAttributeButtonRow } from "./CharacterAttributeButtonRow.tsx"
import {
	CharacterEditorDialog,
	CharacterEditorDialogButton,
} from "./CharacterEditorDialog.tsx"
import { CharacterVitalFields } from "./CharacterVitalFields.tsx"
import type { ApiCharacter } from "./types.ts"

export function CharacterCard({ character }: { character: ApiCharacter }) {
	return (
		<div className={"flex flex-col gap-3"}>
			<div className="flex items-center gap">
				<Avatar src={character.imageUrl} className="size-14" />
				<div>
					<Heading className={secondaryHeading("leading-none")}>
						{character.name}
					</Heading>
					<p className="mt-1 text-sm font-semibold leading-none tracking-wide text-primary-300 empty:hidden">
						{[character.race, character.pronouns].filter(Boolean).join(" • ")}
					</p>
				</div>
				<CharacterEditorDialog character={character}>
					<CharacterEditorDialogButton
						render={
							<Button
								appearance="clear"
								square
								className="ml-auto"
								icon={<Lucide.Edit className="size-5" />}
							/>
						}
					></CharacterEditorDialogButton>
				</CharacterEditorDialog>
			</div>
			<CharacterAttributeButtonRow character={character} />
			<CharacterVitalFields character={character} />
		</div>
	)
}
