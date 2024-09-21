import { type ComponentProps } from "react"
import type { Something } from "~/common/types.ts"
import { Combobox } from "~/components/Combobox.tsx"
import { Field } from "~/components/Field.tsx"
import { NumberInput } from "~/components/NumberInput.tsx"
import { Select, type SelectProps } from "~/components/Select.tsx"
import { textArea, textInput } from "~/styles/input.ts"
import { type FieldAccessor } from "./useForm.ts"

export interface InputFieldProps extends ComponentProps<"input"> {
	label: string
	field: FieldAccessor<string>
}

export function InputField({
	field,
	className,
	label,
	...props
}: InputFieldProps) {
	return (
		<Field label={label} htmlFor={field.input.id} errors={field.errors}>
			<input {...field.input} {...props} className={textInput()} />
		</Field>
	)
}

export interface FileFieldProps extends ComponentProps<"input"> {
	label: string
	field: FieldAccessor<File>
	type?: never
}

export function FileField({
	field,
	className,
	label,
	...props
}: FileFieldProps) {
	return (
		<Field label={label} htmlFor={field.input.id} errors={field.errors}>
			<input
				{...props}
				type="file"
				className={textInput("items-center")}
				onChange={(event) => {
					field.set(event.currentTarget.files?.[0])
				}}
			/>
		</Field>
	)
}

export interface TextAreaFieldProps extends ComponentProps<"textarea"> {
	label: string
	field: FieldAccessor<string>
	rows?: number
}

export function TextAreaField({
	field,
	className,
	label,
	rows = 3,
	...props
}: TextAreaFieldProps) {
	return (
		<Field label={label} htmlFor={field.input.id} errors={field.errors}>
			<textarea
				{...field.input}
				{...props}
				className={textArea()}
				rows={rows}
			/>
		</Field>
	)
}

export interface ComboboxFieldProps extends ComponentProps<typeof Combobox> {
	label: string
	field: FieldAccessor<string>
}

export function ComboboxField({
	field,
	className,
	label,
	...props
}: ComboboxFieldProps) {
	return (
		<Field label={label} htmlFor={field.input.id} errors={field.errors}>
			<Combobox {...field.input} {...props} className={textInput()} />
		</Field>
	)
}

export interface NumberInputFieldProps
	extends ComponentProps<typeof NumberInput> {
	label: string
	field: FieldAccessor<number>
}

export function NumberInputField({
	field,
	className,
	label,
	...props
}: NumberInputFieldProps) {
	return (
		<Field label={label} htmlFor={field.numeric.id} errors={field.errors}>
			<NumberInput
				{...field.numeric}
				onChange={undefined}
				{...props}
				onSubmitValue={field.set}
				className={textInput()}
			/>
		</Field>
	)
}

export interface SelectFieldProps<T extends Something> extends SelectProps<T> {
	field: FieldAccessor<T>
}

export function SelectField<T extends Something>({
	field,
	...props
}: SelectFieldProps<T>) {
	return <Select<T> {...field.input} onChangeValue={field.set} {...props} />
}
