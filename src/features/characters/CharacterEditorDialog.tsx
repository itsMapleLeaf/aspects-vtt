import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"
import { useMutation } from "convex/react"
import { pick } from "lodash-es"
import { LucideSave, LucideTrash2, Table } from "lucide-react"
import { ComponentProps, useImperativeHandle, useRef } from "react"
import * as v from "valibot"
import { Button } from "~/components/Button.tsx"
import { Combobox } from "~/components/Combobox.tsx"
import { Dialog } from "~/components/Dialog.tsx"
import { NumberInput } from "~/components/NumberInput.tsx"
import { Select } from "~/components/Select.tsx"
import { api } from "~/convex/_generated/api.js"
import { useForm, valibotAction } from "~/features/forms/useForm.ts"
import { textArea, textInput } from "~/styles/input.ts"
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/ui/table.tsx"
import { Form } from "../forms/Form.tsx"
import { FormField } from "../forms/FormField.tsx"
import { RACES, WEALTH_TIERS } from "./constants.ts"
import type { ApiCharacter } from "./types.ts"

export { Button as CharacterEditorDialogButton } from "~/components/Dialog.tsx"

export function CharacterEditorDialog({
	children,
	character,
	...props
}: ComponentProps<typeof Dialog.Root> & {
	character: ApiCharacter
}) {
	const profileEditorRef = useRef<ProfileEditorRef>(null)

	return (
		<Dialog.Root {...props}>
			{children}

			<Dialog.Content
				title="Edit Character"
				className="h-screen max-h-[800px]"
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

					<TabsContent value="profile" className="flex-1">
						<CharacterProfileEditor
							character={character}
							ref={profileEditorRef}
						/>
					</TabsContent>

					<TabsContent value="skills" className="flex-1">
						<CharacterSkillsEditor />
					</TabsContent>

					<TabsContent value="inventory" className="flex-1">
						<CharacterInventoryEditor />
					</TabsContent>
				</Tabs>
			</Dialog.Content>
		</Dialog.Root>
	)
}

type ProfileEditorRef = {
	submit: () => Promise<unknown>
}

function CharacterProfileEditor({
	character,
	ref,
}: {
	character: ApiCharacter
	ref: React.Ref<ProfileEditorRef>
}) {
	const update = useMutation(api.entities.characters.update)

	const form = useForm({
		initialValues: pick(
			character,
			"name",
			"pronouns",
			"race",
			"health",
			"resolve",
			"wealth",
			"notes",
		),

		pendingMessage: "Saving character...",

		action: valibotAction(
			v.object({
				name: v.pipe(
					v.string(),
					v.trim(),
					v.nonEmpty("Cannot be empty"),
					v.maxLength(100, "Must be 100 characters or less"),
				),
				pronouns: v.pipe(
					v.string(),
					v.trim(),
					v.maxLength(100, "Must be 100 characters or less"),
				),
				race: v.pipe(
					v.string(),
					v.trim(),
					v.maxLength(100, "Must be 100 characters or less"),
				),
				health: v.pipe(
					v.string(),
					v.trim(),
					v.transform((input) => parseInt(input, 10)),
					v.integer("Must be an integer (whole number)"),
					v.minValue(0, "Must be a positive number"),
				),
				resolve: v.pipe(
					v.string(),
					v.trim(),
					v.transform((input) => parseInt(input, 10)),
					v.integer("Must be an integer (whole number)"),
					v.minValue(0, "Must be a positive number"),
				),
				wealth: v.pipe(
					v.string(),
					v.trim(),
					v.transform((input) => parseInt(input, 10)),
					v.number(),
					v.integer("Must be an integer (whole number)"),
					v.minValue(0, "Must be a positive number"),
					v.maxValue(WEALTH_TIERS.length - 1),
				),
				notes: v.pipe(v.string(), v.trim(), v.maxLength(50_000)),
			}),
			async (data) => {
				await update({
					...data,
					characterId: character._id,
				})
			},
		),
	})

	useImperativeHandle(ref, () => ({
		submit: form.submit,
	}))

	return (
		<Form form={form} className="flex h-full min-h-0 flex-col gap">
			<FormField form={form} name="name" label="Name">
				<input className={textInput()} />
			</FormField>

			<FormField form={form} name="pronouns" label="Pronouns">
				<Combobox
					className={textInput()}
					options={[
						{ value: "he/him" },
						{ value: "she/her" },
						{ value: "they/them" },
						{ value: "he/they" },
						{ value: "she/they" },
						{ value: "it/its" },
					]}
				/>
			</FormField>

			<FormField form={form} name="race" label="Race">
				<Combobox
					className={textInput()}
					options={RACES.map((race) => ({ value: race.name }))}
				/>
			</FormField>

			{/* <FormField label="Image" htmlFor={inputId("image")}>
				<input
					id={inputId("image")}
					name="image"
					type="file"
					accept="image/*"
					className={control({})}
				/>
			</FormField> */}

			<div className="grid grid-cols-[1fr,1fr,2fr] gap">
				<FormField form={form} label="Health" name="health">
					<NumberInput className={textInput()} max={character.healthMax} />
				</FormField>

				<FormField form={form} name="resolve" label="Resolve">
					<NumberInput className={textInput()} max={character.resolveMax} />
				</FormField>

				<Select
					{...form.getInputProps("wealth")}
					label="Wealth"
					className={textInput()}
					options={WEALTH_TIERS.map((tier, index) => ({
						value: String(index),
						name: `${index + 1}. ${tier.name}`,
					}))}
				/>
			</div>

			<FormField form={form} name="notes" label="Notes">
				<textarea className={textArea()} rows={3} />
			</FormField>

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
