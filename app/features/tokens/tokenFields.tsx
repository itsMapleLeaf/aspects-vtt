import { useMutation } from "convex/react"
import { useId, useState } from "react"
import { toNearestPositiveInt, toPositiveNumber } from "#app/common/numbers.ts"
import { randomItem } from "#app/common/random.js"
import { FormField } from "#app/ui/FormField.js"
import { Input } from "#app/ui/Input.tsx"
import { api } from "#convex/_generated/api.js"
import type { Doc } from "#convex/_generated/dataModel.js"
import type { MapTokenValue } from "#convex/mapTokens.js"
import { characterNames } from "../characters/characterNames.ts"

interface TokenFieldArgs {
	label: string
	fallback: () => MapTokenValue
	display?:
		| {
				type: "tag"
				getText: (values: Map<string, MapTokenValue>) => string
		  }
		| {
				type: "bar"
				getValue: (values: Map<string, MapTokenValue>) => number
				getMax: (values: Map<string, MapTokenValue>) => number
		  }
}

interface TokenFieldConfig extends TokenFieldArgs {
	Input: React.ComponentType<TokenInputProps>
}

interface TokenFieldProps extends TokenFieldConfig {
	token: Doc<"mapTokens">
}

interface TokenInputProps {
	id: string
	onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
	onBlur: () => void
	getValue: (key: string) => MapTokenValue | undefined
	setValue: (key: string, value: MapTokenValue) => void
}

export const TOKEN_FIELDS: TokenFieldConfig[] = [
	defineTextField({
		label: "Name",
		fallback: () => randomItem(characterNames) ?? "Cute Felirian",
		display: {
			type: "tag",
			getText: (values) => String(values.get("name") ?? "Cute Felirian"),
		},
	}),
	defineIntField({
		label: "Health",
		fallback: () => 8,
		display: {
			type: "bar",
			getValue: (values) => toPositiveNumber(values.get("health")) ?? 8,
			getMax: (values) => toPositiveNumber(values.get("health:max")) ?? 8,
		},
		hasMax: true,
	}),
	defineIntField({
		label: "Fatigue",
		fallback: () => 0,
	}),
]

export function TokenField({ token, Input, ...config }: TokenFieldProps) {
	const values = new Map(token.fields?.map((field) => [field.key, field.value]))
	const [updates, setUpdates] = useState<ReadonlyMap<string, MapTokenValue>>(new Map())
	const updateToken = useMutation(api.mapTokens.update)
	const [pending, setPending] = useState(false)

	const submit = async () => {
		setPending(true)
		try {
			const fields = [...new Map([...values, ...updates])].map(([key, value]) => ({ key, value }))
			await updateToken({ id: token._id, fields })
			setUpdates(new Map())
		} finally {
			setPending(false)
		}
	}

	const id = useId()
	const props: TokenInputProps = {
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

interface TextFieldArgs extends TokenFieldArgs {
	fallback: () => string
	key?: string
}

function defineTextField({
	label,
	key = label.toLowerCase(),
	...options
}: TextFieldArgs): TokenFieldConfig {
	return {
		...options,
		label,
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
	}
}

interface IntFieldArgs extends TokenFieldArgs {
	fallback: () => number
	key?: string
	hasMax?: boolean
}

function defineIntField({
	label,
	key = label.toLowerCase(),
	hasMax = false,
	...options
}: IntFieldArgs): TokenFieldConfig {
	const maxKey = `${label}:max`
	return {
		...options,
		label,
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
	}
}
