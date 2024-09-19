import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"
import { useMutation } from "convex/react"
import { LucideSave, LucideTrash2, Table } from "lucide-react"
import { ComponentProps, startTransition, useId, useRef } from "react"
import { twMerge } from "tailwind-merge"
import * as v from "valibot"
import { vfd } from "~/common/valibot-form-data.ts"
import { Button } from "~/components/Button.tsx"
import { Combobox } from "~/components/Combobox.tsx"
import { Dialog } from "~/components/Dialog.tsx"
import { FormField } from "~/components/FormField.tsx"
import { NumberInput } from "~/components/NumberInput.tsx"
import { Select } from "~/components/Select.tsx"
import { useToastAction } from "~/components/ToastActionForm.tsx"
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
	const update = useMutation(api.entities.characters.update)
	const profileEditorFormRef = useRef<HTMLFormElement>(null)

	const [, submit] = useToastAction(
		async (_state, formData: FormData) => {
			const schema = vfd.formData({
				name: vfd.text(),
				pronouns: v.optional(v.pipe(vfd.text(), v.maxLength(100))),
				race: v.optional(v.pipe(vfd.text(), v.maxLength(100))),
				health: v.pipe(vfd.number(), v.integer(), v.minValue(0)),
				resolve: v.pipe(vfd.number(), v.integer(), v.minValue(0)),
				wealth: v.pipe(
					vfd.number(),
					v.integer(),
					v.minValue(0),
					v.maxValue(WEALTH_TIERS.length - 1),
				),
				notes: v.optional(v.pipe(vfd.text(), v.maxLength(50_000))),
			})

			const data = v.parse(schema, formData)

			await update({
				...data,
				characterId: character._id,
			})
		},
		{
			pendingMessage: "Saving character...",
		},
	)

	return (
		<Dialog.Root {...props}>
			{children}

			<Dialog.Content
				title="Edit Character"
				className="h-screen max-h-[800px]"
				onClose={() => {
					startTransition(() => {
						submit(new FormData(profileEditorFormRef.current ?? undefined))
					})
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
							action={submit}
							ref={profileEditorFormRef}
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

function CharacterProfileEditor({
	character,
	...props
}: { character: ApiCharacter } & ComponentProps<"form">) {
	const inputIdPrefix = useId()
	const inputId = (suffix: string) => `${inputIdPrefix}:${suffix}`

	return (
		<form
			{...props}
			className={twMerge("flex h-full min-h-0 flex-col gap", props.className)}
		>
			<FormField label="Name" inputId={inputId("name")}>
				<input
					id={inputId("name")}
					name="name"
					required
					className={textInput()}
					defaultValue={character.name}
				/>
			</FormField>
			<FormField label="Pronouns" inputId={inputId("pronouns")}>
				<Combobox
					id={inputId("pronouns")}
					name="pronouns"
					className={textInput()}
					defaultValue={character.pronouns}
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
			<FormField label="Race" inputId={inputId("race")}>
				<Combobox
					id={inputId("race")}
					name="race"
					className={textInput()}
					defaultValue={character.race}
					options={RACES.map((race) => ({ value: race.name }))}
				/>
			</FormField>
			<FormField label="Image" inputId={inputId("image")}>
				<input
					id={inputId("image")}
					name="image"
					type="file"
					accept="image/*"
					className={control({})}
				/>
			</FormField>
			<div className="grid grid-cols-[1fr,1fr,2fr] gap">
				<FormField label="Health" inputId={inputId("health")}>
					<NumberInput
						id={inputId("health")}
						name="health"
						className={textInput()}
						defaultValue={character.health}
						max={character.healthMax}
					/>
				</FormField>
				<FormField label="Resolve" inputId={inputId("resolve")}>
					<NumberInput
						id={inputId("resolve")}
						name="resolve"
						className={textInput()}
						defaultValue={character.resolve}
						max={character.resolveMax}
					/>
				</FormField>
				<Select
					name="wealth"
					label="Wealth"
					className={textInput()}
					defaultValue={String(character.wealth ?? "0")}
					options={WEALTH_TIERS.map((tier, index) => ({
						value: String(index),
						name: `${index + 1}. ${tier.name}`,
					}))}
				/>
			</div>
			<FormField label="Notes" inputId={inputId("notes")}>
				<textarea
					id={inputId("notes")}
					name="notes"
					defaultValue={character.notes}
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
