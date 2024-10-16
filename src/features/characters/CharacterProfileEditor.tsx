import { useMutation } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import { startCase } from "lodash-es"
import { useId, useState, type ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { Combobox } from "~/components/Combobox.tsx"
import { Field } from "~/components/Field.tsx"
import { Heading } from "~/components/Heading.tsx"
import { NumberInput } from "~/components/NumberInput.tsx"
import { api } from "~/convex/_generated/api.js"
import { NormalizedCharacter } from "~/convex/characters.ts"
import { RACE_NAMES } from "~/features/characters/races.ts"
import { WealthTierSelect } from "~/features/characters/WealthTierSelect.tsx"
import { List } from "~/shared/list.ts"
import { textArea, textInput } from "~/styles/input.ts"
import { panel } from "~/styles/panel.ts"
import { secondaryHeading } from "~/styles/text.ts"
import { useDebouncedCallback } from "../../common/react/state.ts"
import { Checkbox } from "../../components/Checkbox.tsx"
import { Select } from "../../components/Select.tsx"
import { getImageUrl } from "../images/getImageUrl.ts"
import { ImageUploader } from "../images/ImageUploader.tsx"
import { uploadImage } from "../images/uploadImage.ts"
import { ATTRIBUTE_NAMES, ATTRIBUTE_POINTS_AVAILABLE } from "./attributes.ts"
import { CharacterPlayerSelect } from "./CharacterPlayerSelect.tsx"

export function CharacterProfileEditor({
	character: characterProp,
}: {
	character: NormalizedCharacter
}) {
	type PatchPayload = Partial<
		Pick<
			NormalizedCharacter,
			| "name"
			| "pronouns"
			| "imageId"
			| "race"
			| "health"
			| "resolve"
			| "notes"
			| "attributes"
			| "wealth"
			| "type"
			| "visible"
			| "nameVisible"
		>
	>

	const [patch, setPatch] = useState<PatchPayload>({})

	const character = { ...characterProp, ...patch }

	const update = useMutation(api.characters.update)

	const submitDebounced = useDebouncedCallback(() => {
		update({ ...patch, characterId: character._id }).then((response) => {
			setPatch({})
		})
	}, 300)

	const handleChange = (patch: PatchPayload) => {
		setPatch((current) => ({ ...current, ...patch }))
		submitDebounced()
	}

	const attributePointsRemaining =
		ATTRIBUTE_POINTS_AVAILABLE - List.values(character.attributes).sum()

	const id = useId()

	return (
		<div className="flex flex-col @container gap">
			<div className="flex flex-wrap gap">
				<Checkbox
					label="Public"
					checked={character.visible ?? false}
					onChange={(checked) => handleChange({ visible: checked })}
				/>
				<Checkbox
					label="Show name"
					checked={character.nameVisible ?? false}
					onChange={(checked) => handleChange({ nameVisible: checked })}
				/>
			</div>

			<div className="grid gap @md:grid-cols-2">
				<CharacterPlayerSelect character={character} />
				<Select
					label="Type"
					options={[
						{
							name: "Player",
							description: "Enforces EXP and attribute limits",
							value: "player",
						},
						{
							name: "NPC",
							value: "npc",
							description: "Removes limits",
						},
					]}
					value={character.type}
					onChangeValue={(value) => handleChange({ type: value })}
				/>
			</div>

			<div className="grid gap @md:grid-cols-2">
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

			<div className="grid gap @md:grid-cols-2">
				<div className="flex flex-col justify-between gap">
					<Field label="Image">
						<ImageUploader
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

					<div className="grid grid-cols-2 gap">
						<Field label={`Health / ${character.healthMax}`}>
							<NumberInput
								className={textInput()}
								max={character.healthMax}
								value={character.health}
								onSubmitValue={(value) => handleChange({ health: value })}
							/>
						</Field>
						<Field label={`Resolve / ${character.resolveMax}`}>
							<NumberInput
								className={textInput()}
								max={character.resolveMax}
								value={character.resolve}
								onSubmitValue={(value) => handleChange({ resolve: value })}
							/>
						</Field>
					</div>

					<WealthTierSelect
						value={character.wealth}
						onChange={(value) => handleChange({ wealth: value })}
					/>
				</div>

				<Field label="Attributes">
					<div
						className={panel(
							"flex h-full flex-col items-center justify-center border-primary-600 bg-primary-700 px-4 py-8 gap",
						)}
					>
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
						{ATTRIBUTE_NAMES.map((name) => (
							<AttributeInput
								key={name}
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
						))}
					</div>
				</Field>
			</div>

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
}

function AttributeInput(props: AttributeInputProps) {
	const [internalValue, setInternalValue] = useState(props.defaultValue ?? 1)

	const value = props.value ?? internalValue

	const setValue = (next: number) => {
		setInternalValue(next)
		props.onChange?.(next)
	}

	return (
		<Field label={props.label}>
			<div className="flex gap-2">
				{Iterator.range(1, 5, 1, true)
					.map((n) => (
						<button
							key={n}
							type="button"
							className={twMerge(
								"size-6 rounded-full border-2 border-primary-100 bg-primary-100 bg-opacity-0 transition active:border-primary-300 active:bg-primary-300 active:duration-0",
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
		</Field>
	)
}
