import * as Lucide from "lucide-react"
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
