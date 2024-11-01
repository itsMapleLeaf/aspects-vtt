import { ConvexError } from "convex/values"
import { useId, useState, type SetStateAction } from "react"
import { toast } from "react-toastify"
import * as v from "valibot"
import { useToastAction } from "~/components/ToastActionForm.tsx"
import { AppError } from "~/lib/AppError.ts"
import type { Something } from "~/lib/types.ts"

export type FormValues = Record<string, unknown>

export interface FormConfig<Values extends FormValues> {
	initialValues: Values
	pendingMessage?: string
	successMessage?: string
	action: FormAction
}

export type FormAction = (
	values: FormValues,
) => Promise<readonly FormError[] | undefined>

export interface FormError {
	message: string
	field?: string
}

export interface FieldAccessor<T extends Something = Something> {
	id: string
	name: string
	value: T | undefined
	errors: string[]
	set: (next: SetStateAction<T | undefined>) => void
	label: {
		htmlFor: string
	}
	input: {
		id: string
		name: string
		value: (T & string) | undefined
		onChange: (event: { currentTarget: { value: string } }) => void
	}
	numeric: {
		id: string
		name: string
		value: (T & number) | undefined
		onChange: (event: { currentTarget: { valueAsNumber: number } }) => void
	}
	checkbox: {
		id: string
		name: string
		checked: (T & boolean) | undefined
		onChange: (event: { currentTarget: { checked: boolean } }) => void
	}
}

export type FieldCollection<Values> = Required<{
	[K in keyof Values]: FieldAccessor<Values[K] & Something>
}>

export type FormStore<Values extends FormValues = FormValues> = ReturnType<
	typeof useForm<Values>
>

export function useForm<Values extends FormValues>(
	options: FormConfig<Values>,
) {
	const [values, setValues] = useState(options.initialValues)

	const [errors, submit, pending] = useToastAction<readonly FormError[], void>(
		async (_state) => {
			try {
				return await options.action(values)
			} catch (error) {
				console.log(error)

				if (error instanceof ConvexError && typeof error.data === "string") {
					return [{ message: error.data }]
				}

				if (error instanceof AppError) {
					return [{ message: error.message }]
				}

				console.error("Form submission failed", error)
				toast.error(
					"Form submission failed. Check the browser console for details.",
				)
				return [{ message: "Unknown submission error" }]
			}
		},
		{
			pendingMessage: options.pendingMessage,
			successMessage: options.successMessage,
		},
	)

	const fieldIdPrefix = useId()
	const fieldId = (name: string) => `${fieldIdPrefix}:${name}`

	const fields = new Proxy({} as FieldCollection<Values>, {
		get(_target, name: string) {
			const id = fieldId(name)
			const value = values[name] ?? undefined

			const set = (next: SetStateAction<{} | undefined | null>) => {
				setValues((prev) => ({
					...prev,
					[name]: next instanceof Function ? next(prev[name]) : next,
				}))
			}

			return {
				id,
				name,
				value,
				errors:
					errors
						?.filter((error) => error.field === name)
						.map((error) => error.message) ?? [],
				set,
				label: {
					htmlFor: id,
				},
				input: {
					id,
					name,
					value: typeof value === "string" ? value : undefined,
					onChange: (event) => set(event.currentTarget.value),
				},
				numeric: {
					id,
					name,
					value: typeof value === "number" ? value : undefined,
					onChange: (event) => set(event.currentTarget.valueAsNumber),
				},
				checkbox: {
					id,
					name,
					checked: typeof value === "boolean" ? value : undefined,
					onChange: (event) => set(event.currentTarget.checked),
				},
			} satisfies FieldAccessor
		},
	})

	return {
		values,
		setValues,
		submit: () => submit(),
		pending,
		errors,
		formErrors: errors?.flatMap((e) => (e.field == null ? [e.message] : [])),
		fields,
	}
}

/** @deprecated Use `fields` from {@link useForm} */
export function useFields<Values extends FormValues>({
	fields,
}: FormStore<Values>) {
	return fields
}

export function valibotAction<Values, ActionArgs>(
	schema: v.GenericSchema<Values, ActionArgs>,
	action: (input: ActionArgs) => unknown,
): FormAction {
	return async (data) => {
		const result = v.safeParse(schema, data)
		if (!result.issues) {
			await action(result.output)
		} else {
			return result.issues.map((issue) => ({
				field: issue.path?.[0].key?.toString(),
				message: issue.message,
			}))
		}
	}
}
