import { useMutation } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import { pick, startCase } from "lodash-es"
import { useImperativeHandle, useState, type ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import * as v from "valibot"
import { typed } from "~/common/types.ts"
import {
	longText,
	nonEmptyShortText,
	positiveInteger,
	shortText,
} from "~/common/validators.ts"
import { Field } from "~/components/Field.tsx"
import { Heading } from "~/components/Heading.tsx"
import { api } from "~/convex/_generated/api.js"
import { NormalizedCharacter } from "~/convex/characters.ts"
import { RACE_NAMES } from "~/features/characters/races.ts"
import { wealthTier } from "~/features/characters/validators.ts"
import { WealthTierSelectField } from "~/features/characters/WealthTierSelectField.tsx"
import {
	ComboboxField,
	InputField,
	NumberInputField,
	TextAreaField,
} from "~/features/forms/fields.tsx"
import {
	FieldAccessor,
	useForm,
	valibotAction,
} from "~/features/forms/useForm.ts"
import { uploadImage } from "~/features/images/uploadImage.ts"
import { List } from "~/shared/list.ts"
import { panel } from "~/styles/panel.ts"
import { secondaryHeading } from "~/styles/text.ts"
import { EditorFormLayout } from "../forms/EditorFormLayout.tsx"
import { FormField } from "../forms/FormField.tsx"
import { ATTRIBUTE_NAMES, ATTRIBUTE_POINTS_AVAILABLE } from "./attributes.ts"

export type ProfileEditorRef = {
	submit: () => unknown
}

export function CharacterProfileEditor({
	character,
	ref,
}: {
	character: NormalizedCharacter
	ref: React.Ref<ProfileEditorRef>
}) {
	const update = useMutation(api.characters.update)

	const { fields, ...form } = useForm({
		initialValues: {
			...pick(character, [
				"name",
				"pronouns",
				"race",
				"health",
				"resolve",
				"notes",
				"attributes",
				"wealth",
			]),
			image: typed<File | undefined>(undefined),
		},

		pendingMessage: "Saving character...",

		action: valibotAction(
			v.object({
				name: nonEmptyShortText,
				pronouns: v.optional(shortText),
				race: v.optional(shortText),
				health: v.optional(positiveInteger),
				resolve: v.optional(positiveInteger),
				wealth: v.optional(wealthTier),
				notes: v.optional(longText),
				image: v.optional(
					v.pipe(v.file(), v.maxSize(8_000_000, "File cannot exceed 8MB")),
				),
				attributes: v.object(
					ATTRIBUTE_NAMES.mapToObject((name) => [name, v.number()]),
				),
			}),
			async ({ image, ...data }) => {
				const imageId = image && (await uploadImage(image))
				await update({
					...data,
					...(imageId && { imageId }),
					characterId: character._id,
				})
			},
		),
	})

	useImperativeHandle(ref, () => ({
		submit: form.submit,
	}))

	const attributePointsRemaining =
		ATTRIBUTE_POINTS_AVAILABLE - List.values(form.values.attributes).sum()

	return (
		<EditorFormLayout form={form} className="flex flex-col @container gap">
			<div className="grid gap @md:grid-cols-2">
				<InputField label="Name" field={fields.name} />

				<ComboboxField
					label="Pronouns"
					field={fields.pronouns as FieldAccessor<string>}
					options={[
						{ value: "he/him" },
						{ value: "she/her" },
						{ value: "they/them" },
						{ value: "he/they" },
						{ value: "she/they" },
						{ value: "it/its" },
					]}
				/>
			</div>

			<div className="grid gap @md:grid-cols-2">
				<div className="flex flex-col justify-between gap">
					<FormField label="Image" field={fields.image}>
						<input
							type="file"
							className={panel(
								"aspect-square w-full border-primary-600 bg-primary-700",
							)}
							onChange={(event) => {
								const file = event.currentTarget.files?.[0]
								if (file) fields.image.set(file)
							}}
						/>
					</FormField>

					<ComboboxField
						label="Race"
						field={fields.race as FieldAccessor<string>}
						options={RACE_NAMES.map((value) => ({ value }))}
					/>

					<NumberInputField
						label="Health"
						field={fields.health}
						max={character.healthMax}
					/>

					<NumberInputField
						label="Resolve"
						field={fields.resolve}
						max={character.resolveMax}
					/>

					<WealthTierSelectField field={fields.wealth} />
				</div>

				<Field label="Attributes">
					<div
						className={panel(
							"flex h-full flex-col items-center justify-center border-primary-600 bg-primary-700 px-4 py-8 gap",
						)}
					>
						<Heading
							className={secondaryHeading(
								"text-center tabular-nums",
								attributePointsRemaining < 0 && "text-red-300",
								attributePointsRemaining > 0 && "text-green-300",
							)}
						>
							{attributePointsRemaining}/{ATTRIBUTE_POINTS_AVAILABLE}
							<br />
							points remaining
						</Heading>
						{ATTRIBUTE_NAMES.map((name) => (
							<AttributeInput
								label={startCase(name)}
								value={form.values.attributes[name]}
								onChange={(value) => {
									fields.attributes.set({
										...form.values.attributes,
										[name]: value,
									})
								}}
							/>
						))}
					</div>
				</Field>
			</div>

			<TextAreaField label="Notes" field={fields.notes} rows={3} />
		</EditorFormLayout>
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
