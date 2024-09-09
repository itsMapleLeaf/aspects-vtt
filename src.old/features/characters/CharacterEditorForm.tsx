import { sum } from "lodash-es"
import { LucideSave } from "lucide-react"
import { useState } from "react"
import * as v from "valibot"
import { formDataSchema, formNumberSchema } from "../../lib/validation.js"
import { AttributeField } from "../../ui/AttributeField.js"
import { FormField } from "../../ui/form.js"
import { FormButton } from "../../ui/FormButton"
import { NumberInput } from "../../ui/NumberInput.js"
import {
	formLayout,
	heading2xl,
	innerPanel,
	input,
	solidButton,
} from "../../ui/styles.js"
import { ToastActionForm } from "../../ui/toast.js"
import { ImageDropzone } from "../images/ImageDropzone.js"
import { ApiCharacter } from "./types"

interface CharacterEditorFormProps {
	character: ApiCharacter
	action: (data: v.InferOutput<typeof schema>) => Promise<unknown>
}

const schema = v.pipe(
	formDataSchema(),
	v.object({
		name: v.string(),
		pronouns: v.optional(v.string()),
		species: v.optional(v.string()),
		notes: v.optional(v.string()),

		strength: formNumberSchema(),
		sense: formNumberSchema(),
		mobility: formNumberSchema(),
		intellect: formNumberSchema(),
		wit: formNumberSchema(),

		health: formNumberSchema(),
		resolve: formNumberSchema(),

		image: v.optional(v.file()),
	}),
)

export function CharacterEditorForm({
	character,
	action,
}: CharacterEditorFormProps) {
	const [attributes, setAttributes] = useState({
		strength: character.strength,
		sense: character.sense,
		mobility: character.mobility,
		intellect: character.intellect,
		wit: character.wit,
	})

	const handleAttributeChange =
		(attribute: keyof typeof attributes) => (value: number) => {
			setAttributes((prev) => ({
				...prev,
				[attribute]: value,
			}))
		}

	const totalPoints = 15
	const remainingPoints = totalPoints - sum(Object.values(attributes))

	return (
		<ToastActionForm
			action={(formData) => action(v.parse(schema, formData))}
			message="Saving character..."
			className={formLayout("@container gap-3")}
		>
			<div className="flex flex-col items-stretch gap-y gap-x-3 @md:flex-row">
				<div className="flex flex-1 flex-col gap">
					<ImageDropzone
						name="image"
						defaultImageUrl={character.imageUrl}
						className={{ wrapper: "aspect-square", image: "object-top" }}
					/>

					<FormField label="Name">
						<input
							name="name"
							required
							defaultValue={character.name}
							className={input()}
						/>
					</FormField>
					<FormField label="Pronouns">
						<input
							name="pronouns"
							defaultValue={character.pronouns}
							className={input()}
						/>
					</FormField>
					<FormField label="Species">
						<input
							name="species"
							defaultValue={character.species}
							className={input()}
						/>
					</FormField>
				</div>

				<div
					className={innerPanel(
						"flex flex-1 flex-col items-center px-3 py-6 gap-3",
					)}
				>
					<p
						className={heading2xl(
							"text-center",
							remainingPoints > 0 ? "text-green-300"
							: remainingPoints < 0 ? "text-red-300"
							: "",
						)}
					>
						{remainingPoints}/{totalPoints} points remaining
					</p>

					<div className="flex flex-1 flex-col items-center justify-evenly gap">
						<AttributeField
							name="strength"
							label="Strength"
							value={attributes.strength}
							onChangeValue={handleAttributeChange("strength")}
						/>
						<AttributeField
							name="sense"
							label="Sense"
							value={attributes.sense}
							onChangeValue={handleAttributeChange("sense")}
						/>
						<AttributeField
							name="mobility"
							label="Mobility"
							value={attributes.mobility}
							onChangeValue={handleAttributeChange("mobility")}
						/>
						<AttributeField
							name="intellect"
							label="Intellect"
							value={attributes.intellect}
							onChangeValue={handleAttributeChange("intellect")}
						/>
						<AttributeField
							name="wit"
							label="Wit"
							value={attributes.wit}
							onChangeValue={handleAttributeChange("wit")}
						/>
					</div>
				</div>
			</div>

			<div className="flex flex-col gap @xs:flex-row">
				<FormField label="Health" className="flex-1">
					<div className="flex items-center gap-2">
						<NumberInput
							name="health"
							defaultValue={character.health}
							max={character.healthMax}
							className={input("flex-1")}
						/>
						<div className="w-8">/ {character.healthMax}</div>
					</div>
				</FormField>
				<FormField label="Resolve" className="flex-1">
					<div className="flex items-center gap-2">
						<NumberInput
							name="resolve"
							defaultValue={character.resolve}
							max={character.resolveMax}
							className={input("flex-1")}
						/>
						<div className="w-8">/ {character.resolveMax}</div>
					</div>
				</FormField>
			</div>

			<FormField label="Notes">
				<textarea
					name="notes"
					defaultValue={character.notes}
					className={input("h-[unset] py-1.5 leading-6")}
					rows={8}
				/>
			</FormField>

			<FormButton className={solidButton()}>
				<LucideSave /> Save
			</FormButton>
		</ToastActionForm>
	)
}
