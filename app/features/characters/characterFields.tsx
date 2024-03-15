import { useId, useState } from "react"
import { toNearestPositiveInt, toPositiveNumber } from "#app/common/numbers.ts"
import { randomItem } from "#app/common/random.js"
import { FormField } from "#app/ui/FormField.js"
import { Input } from "#app/ui/Input.tsx"
import { Select } from "#app/ui/Select.js"
import type { Doc } from "#convex/_generated/dataModel.js"
import type { CharacterField, CharacterFieldValue } from "#convex/characters.js"
import { characterNames } from "./characterNames.ts"

interface CharacterFieldConfig {
	label: string
	initialValues: () => CharacterField[]
	fallback: () => CharacterFieldValue
	Input: React.ComponentType<CharacterInputProps>
	identifier?: (values: Map<string, CharacterFieldValue>) => string
	display?:
		| {
				type: "tag"
				getText: (values: Map<string, CharacterFieldValue>) => string
		  }
		| {
				type: "bar"
				getValue: (values: Map<string, CharacterFieldValue>) => number
				getMax: (values: Map<string, CharacterFieldValue>) => number
		  }
}

interface CharacterInputProps {
	id: string
	onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void
	onBlur: () => void
	getValue: (key: string) => CharacterFieldValue | undefined
	setValue: (key: string, value: CharacterFieldValue) => void
}

export const CHARACTER_FIELDS: CharacterFieldConfig[] = [
	defineTextField({
		label: "Name",
		fallback: () => randomItem(characterNames) ?? "Cute Felirian",
		display: "tag",
		isIdentifier: true,
	}),
	defineIntField({
		label: "Health",
		fallback: () => 8,
		hasMax: true,
		display: "bar",
	}),
	defineIntField({
		label: "Fatigue",
		fallback: () => 0,
	}),
	defineDiceSelectField({
		label: "Strength",
	}),
	defineDiceSelectField({
		label: "Sense",
	}),
	defineDiceSelectField({
		label: "Mobility",
	}),
	defineDiceSelectField({
		label: "Intellect",
	}),
	defineDiceSelectField({
		label: "Wit",
	}),
]

export function getCharacterIdentifier(character: Doc<"characters">): string {
	const values = new Map(character.fields?.map(({ key, value }) => [key, value]))
	for (const field of CHARACTER_FIELDS) {
		const identifier = field.identifier?.(values)
		if (identifier) return identifier
	}
	return character._id
}

interface CharacterFormFieldProps extends CharacterFieldConfig {
	fields: CharacterField[] | undefined
	onSubmit: (newFields: CharacterField[]) => Promise<void>
}

export function CharacterFormField({
	fields,
	onSubmit,
	Input,
	...config
}: CharacterFormFieldProps) {
	const values = new Map(fields?.map((field) => [field.key, field.value]))
	const [updates, setUpdates] = useState<ReadonlyMap<string, CharacterFieldValue>>(new Map())
	const [pending, setPending] = useState(false)

	const submit = async () => {
		if (updates.size === 0) return
		if (pending) return

		setPending(true)
		try {
			const fields = [...new Map([...values, ...updates])].map(([key, value]) => ({ key, value }))
			await onSubmit(fields)
			setUpdates(new Map())
		} finally {
			setPending(false)
		}
	}

	const id = useId()
	const props: CharacterInputProps = {
		id,
		getValue(key) {
			return updates.get(key) ?? values.get(key)
		},
		setValue(key, value) {
			if (pending) return
			setUpdates((updates) => new Map(updates).set(key, value))
		},
		onKeyDown(event) {
			if (event.key === "Enter") {
				event.preventDefault()
				submit()
			}
		},
		onBlur() {
			submit()
		},
	}

	return (
		<FormField label={config.label} htmlFor={id}>
			<Input {...props} />
		</FormField>
	)
}

interface TextFieldArgs {
	label: string
	fallback: () => string
	key?: string
	display?: "tag"
	isIdentifier?: boolean
}

function defineTextField({
	label,
	key = label.toLowerCase(),
	display,
	isIdentifier,
	...options
}: TextFieldArgs): CharacterFieldConfig {
	return {
		...options,
		label,
		initialValues: () => [{ key, value: options.fallback() }],
		Input({ getValue, setValue, ...props }) {
			const [fallback] = useState(options.fallback)
			const value = getValue(key)
			return (
				<Input
					{...props}
					type="text"
					value={value != null ? String(value) : fallback}
					onChange={(event) => {
						setValue(key, event.target.value)
					}}
				/>
			)
		},
		...(display === "tag" && {
			display: {
				type: "tag",
				getText: (values) => String(values.get(key) ?? options.fallback()),
			},
		}),
		...(isIdentifier && {
			identifier: (values) => String(values.get(key) ?? options.fallback()),
		}),
	}
}

interface IntFieldArgs {
	label: string
	fallback: () => number
	key?: string
	hasMax?: boolean
	display?: "bar"
}

function defineIntField({
	label,
	key = label.toLowerCase(),
	hasMax = false,
	display,
	...options
}: IntFieldArgs): CharacterFieldConfig {
	const maxKey = `${key}:max`
	return {
		...options,
		label,
		initialValues: () => [
			{ key, value: options.fallback() },
			...(hasMax ? [{ key: maxKey, value: options.fallback() }] : []),
		],
		Input({ getValue, setValue, ...props }) {
			return (
				<div className="flex gap-2">
					<Input
						{...props}
						type="number"
						value={toNearestPositiveInt(getValue(key)) ?? options.fallback()}
						min={0}
						max={
							toNearestPositiveInt(getValue(`${key}:max`)) ??
							(hasMax ? options.fallback() : undefined)
						}
						onChange={(event) => {
							setValue(key, event.target.valueAsNumber)
						}}
					/>
					{hasMax && (
						<>
							<div className="self-center" aria-label="out of">
								/
							</div>
							<Input
								{...props}
								id={`${props.id}-max`}
								type="number"
								value={toNearestPositiveInt(getValue(maxKey)) ?? options.fallback()}
								min={0}
								onChange={(event) => {
									setValue(maxKey, event.target.valueAsNumber)
								}}
							/>
						</>
					)}
				</div>
			)
		},
		...(display === "bar" && {
			display: {
				type: "bar",
				getValue: (values) => toPositiveNumber(values.get(key)) ?? options.fallback(),
				getMax: (values) => toPositiveNumber(values.get(maxKey)) ?? options.fallback(),
			},
		}),
	}
}

interface DiceSelectFieldArgs {
	label: string
	fallback?: () => number
	key?: string
}

const diceOptions = [
	{ value: 4, label: "d4" },
	{ value: 6, label: "d6" },
	{ value: 8, label: "d8" },
	{ value: 12, label: "d12" },
	{ value: 20, label: "d20" },
]

function defineDiceSelectField({
	label,
	key = label.toLowerCase(),
	fallback = () => 4,
	...options
}: DiceSelectFieldArgs): CharacterFieldConfig {
	return {
		...options,
		label,
		initialValues: () => [{ key, value: fallback() }],
		fallback,
		Input({ getValue, setValue, ...props }) {
			let value = getValue(key)
			if (typeof value !== "number" || !diceOptions.some((option) => option.value === value)) {
				value = fallback()
			}
			return (
				<Select
					{...props}
					options={diceOptions}
					value={value}
					onChange={(value) => {
						setValue(key, Number(value))
					}}
				/>
			)
		},
	}
}
