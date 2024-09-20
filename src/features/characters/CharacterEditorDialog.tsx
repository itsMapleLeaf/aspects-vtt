import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"
import { useMutation } from "convex/react"
import { pick } from "lodash-es"
import { LucideSave, LucideTrash2, Table } from "lucide-react"
import { ComponentProps, useId, useImperativeHandle, useRef } from "react"
import * as v from "valibot"
import {
	getFormProps,
	getInputProps,
	getLabelProps,
	useForm,
	valibotValidator,
} from "~/common/forms/useForm.ts"
import { Button } from "~/components/Button.tsx"
import { Combobox } from "~/components/Combobox.tsx"
import { Dialog } from "~/components/Dialog.tsx"
import { FormField } from "~/components/FormField.tsx"
import { NumberInput } from "~/components/NumberInput.tsx"
import { Select } from "~/components/Select.tsx"
import { api } from "~/convex/_generated/api.js"
import { control } from "~/styles/control.ts"
import { textArea, textInput } from "~/styles/input.ts"
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/ui/table.tsx"
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
					profileEditorRef.current?.submit()
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

const validate = valibotValidator(
	v.object({
		name: v.string(),
		pronouns: v.optional(v.pipe(v.string(), v.maxLength(100))),
		race: v.optional(v.pipe(v.string(), v.maxLength(100))),
		health: v.pipe(v.number(), v.integer(), v.minValue(0)),
		resolve: v.pipe(v.number(), v.integer(), v.minValue(0)),
		wealth: v.pipe(
			v.number(),
			v.integer(),
			v.minValue(0),
			v.maxValue(WEALTH_TIERS.length - 1),
		),
		notes: v.optional(v.pipe(v.string(), v.maxLength(50000))),
	}),
)

function CharacterProfileEditor({
	character,
	ref,
}: {
	character: ApiCharacter
	ref: React.Ref<ProfileEditorRef>
}) {
	const inputIdPrefix = useId()
	const inputId = (suffix: string) => `${inputIdPrefix}:${suffix}`
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

		validate: validate,

		async action(data) {
			await update({
				...data,
				characterId: character._id,
			})
		},
	})

	useImperativeHandle(ref, () => ({
		submit: form.submit,
	}))

	return (
		<form {...getFormProps(form)} className="flex h-full min-h-0 flex-col gap">
			<FormField {...getLabelProps(form, "name")} label="Name">
				<input
					{...getInputProps(form, "name")}
					required
					className={textInput()}
				/>
			</FormField>

			<FormField {...getLabelProps(form, "pronouns")} label="Pronouns">
				<Combobox
					{...getInputProps(form, "pronouns")}
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

			<FormField {...getLabelProps(form, "race")} label="Race">
				<Combobox
					{...getInputProps(form, "race")}
					className={textInput()}
					options={RACES.map((race) => ({ value: race.name }))}
				/>
			</FormField>

			<FormField label="Image" htmlFor={inputId("image")}>
				<input
					id={inputId("image")}
					name="image"
					type="file"
					accept="image/*"
					className={control({})}
				/>
			</FormField>

			<div className="grid grid-cols-[1fr,1fr,2fr] gap">
				<FormField label="Health" htmlFor={inputId("health")}>
					<NumberInput
						id={inputId("health")}
						name="health"
						className={textInput()}
						defaultValue={character.health}
						max={character.healthMax}
					/>
				</FormField>

				<FormField label="Resolve" htmlFor={inputId("resolve")}>
					<NumberInput
						id={inputId("resolve")}
						name="resolve"
						className={textInput()}
						defaultValue={character.resolve}
						max={character.resolveMax}
					/>
				</FormField>

				<Select
					{...getInputProps(form, "wealth")}
					label="Wealth"
					className={textInput()}
					options={WEALTH_TIERS.map((tier, index) => ({
						value: String(index),
						name: `${index + 1}. ${tier.name}`,
					}))}
				/>
			</div>

			<FormField {...getLabelProps(form, "notes")} label="Notes">
				<textarea
					{...getInputProps(form, "notes")}
					className={textArea()}
					rows={3}
				/>
			</FormField>

			<Dialog.Actions>
				<Button type="submit" appearance="solid" icon={<LucideSave />}>
					Save
				</Button>
			</Dialog.Actions>
		</form>
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
