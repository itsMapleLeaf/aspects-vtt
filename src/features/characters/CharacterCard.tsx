import { useConvex } from "convex/react"
import * as Lucide from "lucide-react"
import { Avatar } from "~/components/Avatar.tsx"
import { Button } from "~/components/Button.tsx"
import { Collapse } from "~/components/Collapse.tsx"
import { Heading } from "~/components/Heading.tsx"
import { ToastActionForm } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import { type ProtectedCharacter } from "~/convex/characters.ts"
import { interactivePanel, panel } from "~/styles/panel.ts"
import { secondaryHeading } from "~/styles/text.ts"
import { Id } from "../../../convex/_generated/dataModel"
import { ensure } from "../../../shared/errors.ts"
import { Dialog } from "../../components/Dialog.tsx"
import { Field } from "../../components/Field.tsx"
import { getImageUrl } from "../images/getImageUrl.ts"
import { useRoomContext } from "../rooms/context.tsx"
import { CharacterAttributeButtonRow } from "./CharacterAttributeButtonRow.tsx"
import { CharacterConditionsInput } from "./CharacterConditionsInput.tsx"
import {
	CharacterEditorDialog,
	CharacterEditorDialogButton,
} from "./CharacterEditorDialog.tsx"
import { CharacterMenuTrigger } from "./CharacterMenu.tsx"
import { CharacterToggleCombatMemberButton } from "./CharacterToggleCombatMemberButton.tsx"
import { CharacterToggleTokenButton } from "./CharacterToggleTokenButton.tsx"
import { CharacterVitalFields } from "./CharacterVitalFields.tsx"
import { RaceAbilityList } from "./RaceAbilityList.tsx"

export function CharacterCard({
	character,
	afterClone,
}: {
	character: ProtectedCharacter
	afterClone: (characterId: Id<"characters">) => void
}) {
	const room = useRoomContext()
	const convex = useConvex()

	const buttonContent = (
		<>
			<CharacterMenuTrigger
				characterIds={[character._id]}
				className="flex w-full items-center gap-2"
			>
				<Avatar
					src={character.imageId && getImageUrl(character.imageId)}
					className="size-12"
				/>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-1.5">
						<Heading
							className={secondaryHeading("shrink truncate empty:hidden")}
						>
							{character.identity?.name ?? (
								<span className="opacity-70">(unknown)</span>
							)}
						</Heading>
						{character.full && !character.full.nameVisible && (
							<Lucide.EyeOff className="size-4 shrink-0 opacity-50" />
						)}
						{character.isPlayer && (
							<Lucide.User2 className="size-4 shrink-0 opacity-70" />
						)}
					</div>
					<p className="mt-1 text-sm font-semibold leading-none tracking-wide text-primary-300 empty:hidden">
						{[character.race, character.identity?.pronouns]
							.filter(Boolean)
							.join(" • ")}
					</p>
				</div>
			</CharacterMenuTrigger>
		</>
	)

	const buttonClass = interactivePanel(
		"group flex w-full items-center p-2 text-start gap-2",
	)

	if (!character.full) {
		return (
			<Dialog.Root>
				<Dialog.Button type="button" className={buttonClass}>
					{buttonContent}
				</Dialog.Button>
				<Dialog.Content
					title={character.identity?.name ?? "(unknown)"}
					description="Character details"
				>
					{character.imageId && (
						<img
							src={getImageUrl(character.imageId)}
							alt=""
							className={panel("min-h-0 flex-1 bg-primary-900 object-contain")}
						/>
					)}
					<div className="grid auto-cols-fr grid-flow-col gap empty:hidden">
						{character.race && <Field label="Race">{character.race}</Field>}
						{character.identity && (
							<Field label="Pronouns">{character.identity.pronouns}</Field>
						)}
					</div>
					{character.race && (
						<Field label="Abilities">
							<RaceAbilityList race={character.race} />
						</Field>
					)}
				</Dialog.Content>
			</Dialog.Root>
		)
	}

	return (
		<div>
			<Collapse>
				<Collapse.Button className={buttonClass}>
					{buttonContent}
					<Lucide.ChevronLeft className="ml-auto transition-transform group-aria-expanded:-rotate-90" />
				</Collapse.Button>

				<Collapse.Content>
					<div className="flex flex-col py-2 gap-2">
						<CharacterAttributeButtonRow characters={[character.full]} />
						<CharacterVitalFields character={character.full} />
						<CharacterConditionsInput characterIds={[character.full._id]} />

						{character.race && (
							<Field label="Abilities">
								<RaceAbilityList race={character.race} />
							</Field>
						)}

						<div className="grid auto-cols-fr grid-flow-col gap">
							{room.isOwner ? (
								<>
									<CharacterEditorDialog character={character.full}>
										<CharacterEditorDialogButton
											render={
												<Button
													icon={<Lucide.Edit className="size-5" />}
													tooltip="Edit"
												>
													<span className="sr-only">Edit</span>
												</Button>
											}
										></CharacterEditorDialogButton>
									</CharacterEditorDialog>
									<ToastActionForm
										className="contents"
										action={() =>
											convex.mutation(api.characters.remove, {
												characterIds: [character._id],
											})
										}
									>
										<Button
											type="submit"
											icon={<Lucide.Trash className="size-5" />}
											tooltip="Delete"
										>
											<span className="sr-only">Delete</span>
										</Button>
									</ToastActionForm>
									<ToastActionForm
										className="contents"
										action={async () => {
											const [id] = await convex.mutation(
												api.characters.duplicate,
												{
													characterIds: [character._id],
												},
											)
											afterClone(ensure(id, "no character ID after duplicate"))
										}}
									>
										<Button
											type="submit"
											icon={<Lucide.Copy className="size-5" />}
											tooltip="Clone"
										>
											<span className="sr-only">Clone</span>
										</Button>
									</ToastActionForm>
								</>
							) : (
								<CharacterEditorDialog character={character.full}>
									<CharacterEditorDialogButton
										render={
											<Button icon={<Lucide.Edit className="size-5" />}>
												Edit
											</Button>
										}
									></CharacterEditorDialogButton>
								</CharacterEditorDialog>
							)}
						</div>

						<CharacterToggleTokenButton characters={[character.full]} />
						<CharacterToggleCombatMemberButton characters={[character.full]} />
					</div>
				</Collapse.Content>
			</Collapse>
		</div>
	)
}
