import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"
import { useMutation } from "convex/react"
import { pick } from "lodash-es"
import { LucideSave, LucideTrash2, Table } from "lucide-react"
import { ComponentProps, useImperativeHandle, useRef } from "react"
import * as v from "valibot"
import { typed } from "~/common/types.ts"
import {
	longText,
	nonEmptyShortText,
	positiveInteger,
	shortText,
} from "~/common/validators.ts"
import { Button } from "~/components/Button.tsx"
import { Dialog } from "~/components/Dialog.tsx"
import { api } from "~/convex/_generated/api.js"
import type { NormalizedCharacter } from "~/convex/characters.ts"
import {
	ComboboxField,
	FileField,
	InputField,
	NumberInputField,
	SelectField,
	TextAreaField,
} from "~/features/forms/fields.tsx"
import {
	FieldAccessor,
	useFields,
	useForm,
	valibotAction,
} from "~/features/forms/useForm.ts"
import { textInput } from "~/styles/input.ts"
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/ui/table.tsx"
import { Form } from "../forms/Form.tsx"
import { uploadImage } from "../images/uploadImage.ts"
import { WEALTH_TIERS } from "./constants.ts"
import { RACE_NAMES } from "./races.ts"
import { wealthTier } from "./validators.ts"

export { Button as CharacterEditorDialogButton } from "~/components/Dialog.tsx"

export function CharacterEditorDialog({
	children,
	character,
	...props
}: ComponentProps<typeof Dialog.Root> & {
	character: NormalizedCharacter
}) {
	const profileEditorRef = useRef<ProfileEditorRef>(null)

	return (
		<Dialog.Root {...props}>
			{children}

			<Dialog.Content
				title="Edit Character"
				className="h-screen"
				onClose={() => {
					// profileEditorRef.current?.submit()
				}}
			>
				<Tabs className="flex h-full min-h-0 flex-col" defaultValue="profile">
					<TabsList>
						<TabsTrigger value="profile">Profile</TabsTrigger>
						<TabsTrigger value="skills">Skills</TabsTrigger>
						<TabsTrigger value="inventory">Inventory</TabsTrigger>
					</TabsList>

					<TabsContent
						value="profile"
						className="-mx-3 -mb-3 min-h-0 flex-1 overflow-y-auto p-3"
					>
						<CharacterProfileEditor
							character={character}
							ref={profileEditorRef}
						/>
					</TabsContent>

					<TabsContent
						value="skills"
						className="-mx-3 -mb-3 min-h-0 flex-1 overflow-y-auto p-3"
					>
						<CharacterSkillsEditor />
					</TabsContent>

					<TabsContent
						value="inventory"
						className="-mx-3 -mb-3 min-h-0 flex-1 overflow-y-auto p-3"
					>
						<CharacterInventoryEditor />
					</TabsContent>
				</Tabs>
			</Dialog.Content>
		</Dialog.Root>
	)
}

type ProfileEditorRef = {
	submit: () => unknown
}

function CharacterProfileEditor({
	character,
	ref,
}: {
	character: NormalizedCharacter
	ref: React.Ref<ProfileEditorRef>
}) {
	const update = useMutation(api.characters.update)

	const form = useForm({
		initialValues: {
			...pick(character, [
				"name",
				"pronouns",
				"race",
				"health",
				"resolve",
				"wealth",
				"notes",
			] as const),
			wealth: String(character.wealth), // select only supports string for now
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
				wealth: v.optional(
					v.pipe(
						v.string(),
						v.transform((input) => parseInt(input, 10)),
						wealthTier,
					),
				),
				notes: v.optional(longText),
				image: v.optional(
					v.pipe(v.file(), v.maxSize(8_000_000, "File cannot exceed 8MB")),
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

	const fields = useFields(form)

	useImperativeHandle(ref, () => ({
		submit: form.submit,
	}))

	return (
		<Form form={form} className="flex h-full flex-col gap">
			<FileField label="Image" field={fields.image} />

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

			<ComboboxField
				label="Race"
				field={fields.race as FieldAccessor<string>}
				options={RACE_NAMES.map((value) => ({ value }))}
			/>

			<div className="grid grid-cols-[1fr,1fr,2fr] gap">
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

				<SelectField
					label="Wealth"
					field={fields.wealth}
					options={WEALTH_TIERS.map((tier, index) => ({
						value: String(index),
						name: `${index + 1}. ${tier.name}`,
					}))}
				/>
			</div>

			<TextAreaField label="Notes" field={fields.notes} rows={3} />

			<Dialog.Actions>
				<Button type="submit" appearance="solid" icon={<LucideSave />}>
					Save
				</Button>
			</Dialog.Actions>
		</Form>
	)
}

function CharacterSkillsEditor() {
	return <p>skills</p>
}

function CharacterInventoryEditor() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Item</TableHead>
					<TableHead>Quantity</TableHead>
					<TableHead>
						<span className="sr-only">Actions</span>
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{[
					{
						id: "1",
						name: "Dagger",
						description: "It's very sharp.",
						quantity: 2,
					},
					{
						id: "2",
						name: "Energy Drink",
						description: "Give yourself a boost.",
						quantity: 1,
					},
					{
						id: "3",
						name: "Rare Gem",
						description: "This probably sells for a lot.",
						quantity: 999,
					},
				].map((item) => (
					<TableRow key={item.id}>
						<TableCell>
							<p className="text-lg font-light leading-tight">{item.name}</p>
							<p className="font-semibold text-primary-200">
								{item.description}
							</p>
						</TableCell>
						<TableCell>
							<input
								defaultValue={item.quantity}
								className={textInput("w-20 text-center")}
							/>
						</TableCell>
						<TableCell>
							<Button
								appearance="clear"
								icon={<LucideTrash2 />}
								square
								type="button"
							></Button>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
