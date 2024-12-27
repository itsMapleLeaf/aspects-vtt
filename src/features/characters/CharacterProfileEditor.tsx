import { useMutation } from "convex/react"
import { startCase } from "es-toolkit"
import { Iterator } from "iterator-helpers-polyfill"
import { Fragment, useId, useState, type ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { Combobox } from "~/components/Combobox.tsx"
import { Field } from "~/components/Field.tsx"
import { Heading } from "~/components/Heading.tsx"
import { NormalizedCharacter } from "~/convex/characters.ts"
import { RaceAbilityList } from "~/features/characters/RaceAbilityList.tsx"
import { RACE_NAMES } from "~/features/characters/races.ts"
import { List } from "~/lib/list.ts"
import { textArea, textInput } from "~/styles/input.ts"
import { panel } from "~/styles/panel.ts"
import { secondaryHeading } from "~/styles/text.ts"
import { api } from "../../../convex/_generated/api"
import { usePatchUpdate } from "../../hooks/usePatchUpdate.ts"
import { DieIcon } from "../dice/DieIcon.tsx"
import { ImageUploader } from "../images/ImageUploader.tsx"
import { getImageUrl } from "../images/getImageUrl.ts"
import { uploadImage } from "../images/uploadImage.ts"
import { CharacterAttributeButton } from "./CharacterAttributeButton.tsx"
import { ATTRIBUTE_NAMES, ATTRIBUTE_POINTS_AVAILABLE } from "./attributes.ts"
import { getAttributeDie } from "./helpers.ts"

export function CharacterProfileEditor({
	character: characterProp,
}: {
	character: NormalizedCharacter
}) {
	const update = useMutation(api.characters.update)
	const { patched: character, update: handleChange } = usePatchUpdate(
		characterProp,
		(patch) => update({ ...patch, characterId: characterProp._id }),
	)

	const attributePointsUsed = List.values(character.attributes).sum()
	const attributePointsRemaining =
		ATTRIBUTE_POINTS_AVAILABLE - attributePointsUsed

	const id = useId()

	return (
		<div className="gap @container flex flex-col">
			<div className="gap grid @md:grid-cols-2">
				<Field
					label="Name"
					htmlFor={`${id}:name`} /* errors={fieldErrors.name} */
				>
					<input
						id={`${id}:name`}
						className={textInput()}
						value={character.name}
						onChange={(event) => handleChange({ name: event.target.value })}
					/>
				</Field>

				<Field label="Pronouns" htmlFor={`${id}:pronouns`}>
					<Combobox
						value={character.pronouns}
						onChangeValue={(value) => handleChange({ pronouns: value })}
						options={[
							{ value: "he/him" },
							{ value: "she/her" },
							{ value: "they/them" },
							{ value: "he/they" },
							{ value: "she/they" },
							{ value: "it/its" },
						]}
					/>
				</Field>
			</div>
			<div className="gap grid @md:grid-cols-2">
				<div className="gap @container flex flex-col justify-between">
					<Field label="Image" className="flex-1">
						<ImageUploader
							className="aspect-auto h-full min-h-[100cqw]"
							imageUrl={character.imageId && getImageUrl(character.imageId)}
							onUpload={async ([file]) => {
								const imageId = await uploadImage(file)
								handleChange({ imageId })
							}}
						/>
					</Field>

					<Field label="Race">
						<Combobox
							value={character.race}
							onChangeValue={(value) => handleChange({ race: value })}
							options={RACE_NAMES.map((value) => ({ value }))}
						/>
					</Field>
				</div>

				<Field label="Attributes">
					<div
						className={panel(
							"border-primary-600 bg-primary-700 flex h-full flex-col items-center justify-center gap-4 px-4 py-8",
						)}
					>
						{character.type === "npc" ? (
							<Heading className="mb-3 text-center tabular-nums transition">
								<div className="text-2xl">{attributePointsUsed}</div>
								<div className="-mt-2 text-lg">points used</div>
							</Heading>
						) : (
							<Heading
								className={secondaryHeading(
									"mb-3 text-center tabular-nums transition",
									attributePointsRemaining < 0 && "text-red-300",
									attributePointsRemaining > 0 && "text-green-300",
								)}
							>
								<div className="text-2xl">
									{attributePointsRemaining} / {ATTRIBUTE_POINTS_AVAILABLE}
								</div>
								<div className="-mt-2 text-lg">points remaining</div>
							</Heading>
						)}

						{ATTRIBUTE_NAMES.map((name) => (
							<Fragment key={name}>
								<div className="flex items-center gap-4">
									<Field label={startCase(name)}>
										<AttributeInput
											label={startCase(name)}
											value={character.attributes[name]}
											onChange={(value) => {
												handleChange({
													attributes: {
														...character.attributes,
														[name]: value,
													},
												})
											}}
										/>
									</Field>
									<CharacterAttributeButton
										characters={[character]}
										attribute={name}
										icon={
											<DieIcon
												faces={getAttributeDie(character.attributes[name])}
												label={null}
											/>
										}
									/>
								</div>
							</Fragment>
						))}
					</div>
				</Field>
			</div>

			{character.race && (
				<Field label="Abilities">
					<RaceAbilityList race={character.race} />
				</Field>
			)}

			<Field label="Notes">
				<textarea
					rows={3}
					className={textArea()}
					value={character.notes}
					onChange={(event) => handleChange({ notes: event.target.value })}
				/>
			</Field>
		</div>
	)
}

interface AttributeInputProps {
	label: ReactNode
	value?: number
	defaultValue?: number
	onChange?: (value: number) => void
	right?: ReactNode
}

function AttributeInput(props: AttributeInputProps) {
	const [internalValue, setInternalValue] = useState(props.defaultValue ?? 1)

	const value = props.value ?? internalValue

	const setValue = (next: number) => {
		setInternalValue(next)
		props.onChange?.(next)
	}

	return (
		<div className="flex gap-2">
			{Iterator.range(1, 5, 1, true)
				.map((n) => (
					<button
						key={n}
						type="button"
						className={twMerge(
							"border-primary-100 bg-primary-100 bg-opacity-0 active:border-primary-300 active:bg-primary-300 size-6 rounded-full border-2 transition active:duration-0",
							n <= value ? "bg-opacity-100" : "hover:bg-opacity-50",
						)}
						onClick={() => setValue(n)}
					>
						<span className="sr-only">
							Set {props.label} to {n}
						</span>
					</button>
				))
				.toArray()}
		</div>
	)
}
