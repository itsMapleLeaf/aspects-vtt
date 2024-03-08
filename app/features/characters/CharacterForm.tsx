import { api } from "convex-backend/_generated/api.js"
import type { Doc } from "convex-backend/_generated/dataModel.js"
import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { type ComponentPropsWithoutRef, type ReactNode, useId, useState } from "react"
import { expect } from "~/common/expect.ts"
import { CharacterFields } from "~/features/characters/fields.ts"
import { Button } from "~/ui/Button.tsx"
import { Input } from "~/ui/Input.tsx"

export function CharacterForm({ character }: { character: Doc<"characters"> }) {
	const valuesById = Object.fromEntries(
		character.values?.map((value) => [value.key, value.value]) ?? [],
	)

	const [updates, setUpdates] = useState<
		Partial<{
			name: string
			[fieldKey: string]: string | number | boolean
		}>
	>({})

	const update = useMutation(api.characters.update)

	const submit = async () => {
		if (Object.keys(updates).length === 0) return

		const { name, ...updatedValues } = updates
		const newValues = { ...valuesById }

		for (const [key, value] of Object.entries(updatedValues)) {
			if (value !== undefined) {
				newValues[key] = value
			} else {
				delete newValues[key]
			}
		}

		await update({
			id: character._id,
			name: updates.name,
			values: Object.entries(newValues).map(([key, value]) => ({ key, value })),
		})

		setUpdates({})
	}

	return (
		<form action={submit} className="flex h-full flex-col gap-2">
			<fieldset className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
				<TextField
					label="Name"
					value={updates.name ?? character?.name}
					onChangeValue={(name) => setUpdates((updates) => ({ ...updates, name }))}
				/>
				{CharacterFields.map((field) => (
					<TextField
						key={field.key}
						label={field.label}
						value={String(updates[field.key] ?? valuesById[field.key] ?? field.fallback ?? "")}
						onChangeValue={(value) => setUpdates((updates) => ({ ...updates, [field.key]: value }))}
					/>
				))}
			</fieldset>
			<Button type="submit" icon={<Lucide.Save />} text="Save" className="self-start" />
		</form>
	)
}

function TextField({
	label,
	className,
	onChangeValue,
	...props
}: ComponentPropsWithoutRef<"input"> & {
	label: string
	onChangeValue: (value: string) => void
}) {
	const inputId = useId()
	return (
		<Field label={label} className={className} htmlFor={inputId}>
			<Input
				id={inputId}
				type="text"
				icon={<Lucide.Edit />}
				className="w-full"
				{...props}
				onChange={(event) => {
					onChangeValue(event.target.value)
					props.onChange?.(event)
				}}
				onBlur={(event) => {
					const form = expect(event.currentTarget.form, "Element has no form")
					form.requestSubmit()
				}}
			/>
		</Field>
	)
}

function Field({
	label,
	htmlFor,
	className,
	children,
}: {
	label: ReactNode
	htmlFor: string | undefined
	className?: string
	children: React.ReactNode
}) {
	return (
		<div className={className}>
			{htmlFor ?
				<label htmlFor={htmlFor} className="text-sm/4 font-medium">
					{label}
				</label>
			:	<p className="text-sm/4 font-medium">{label}</p>}
			{children}
		</div>
	)
}
